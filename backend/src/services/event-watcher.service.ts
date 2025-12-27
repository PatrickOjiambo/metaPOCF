import { env } from "../env.js";
import { ProcessedEvent, Treasury } from "../models/index.js";
import {
  SseClient,
  EventName,
  type TransactionProcessedEvent as SdkTransactionProcessedEvent,
  type BlockAddedEvent as SdkBlockAddedEvent,
} from "casper-js-sdk";
/**
 * Casper Event Watcher Service
 * Monitors the Casper Sidecar SSE stream for contract events
 * Implements idempotency and event deduplication
 */

export interface CasperEvent {
  event_id: string;
  deploy_hash: string;
  block_height: number;
  timestamp: string;
  event_type: string;
  data: {
    public_key: string;
    amount?: string;
    [key: string]: unknown;
  };
}

export class EventWatcherService {
  private isRunning = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000;
  private sseClient: SseClient | null = null;
  private lastEventId: number | null = null;

  constructor(
    private sidecarUrl: string = env.CASPER_SIDECAR_URL,
    private contractHash: string = env.CONTRACT_HASH,
  ) { }

  /**
   * Start watching for events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[EventWatcher] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[EventWatcher] Starting event watcher");
    console.log(`[EventWatcher] Sidecar URL: ${this.sidecarUrl}`);
    console.log(`[EventWatcher] Contract Hash: ${this.contractHash}`);

    await this.connectToStream();
  }

  /**
   * Stop watching for events
   */
  stop(): void {
    this.isRunning = false;

    if (this.sseClient) {
      this.sseClient.stop();
      this.sseClient = null;
    }

    console.log("[EventWatcher] Stopped");
  }

  /**
   * Connect to SSE stream and subscribe to events
   */
  private async connectToStream(): Promise<void> {
    try {
      console.log("[EventWatcher] Connecting to Casper SSE stream...");
      console.log(`[EventWatcher] URL: ${this.sidecarUrl}`);

      // Create SSE client
      this.sseClient = new SseClient(this.sidecarUrl);

      // Subscribe to TransactionProcessed events
      this.sseClient.subscribe(EventName.TransactionProcessedEventType, (rawEvent) => {
        try {
          const parsedEvent = rawEvent.parseAsTransactionProcessedEvent();
          this.handleTransactionProcessedEvent(parsedEvent);
        } catch (error) {
          console.error("[EventWatcher] Error parsing TransactionProcessed event:", error);
        }
      });

      // Subscribe to BlockAdded events for monitoring
      this.sseClient.subscribe(EventName.BlockAddedEventType, (rawEvent) => {
        try {
          const parsedEvent: SdkBlockAddedEvent = rawEvent.parseAsBlockAddedEvent();
          const blockHash = parsedEvent.BlockAdded?.blockHash;
          if (blockHash) {
            console.log(`[EventWatcher] New block added: ${blockHash}`);
          }
        } catch (error) {
          console.error("[EventWatcher] Error parsing BlockAdded event:", error);
        }
      });

      // Start the client with the last known event ID if available
      if (this.lastEventId !== null) {
        console.log(`[EventWatcher] Resuming from event ID: ${this.lastEventId}`);
        this.sseClient.start(this.lastEventId);
      } else {
        this.sseClient.start();
      }

      console.log("[EventWatcher] Successfully connected to event stream");
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("[EventWatcher] Error connecting to stream:", error);
      this.handleStreamError();
    }
  }

  /**
   * Handle TransactionProcessed events and extract contract-specific events
   */
  private async handleTransactionProcessedEvent(event: SdkTransactionProcessedEvent): Promise<void> {
    try {
      const payload = event.transactionProcessedPayload;
      const transactionHash = payload.transactionHash;
      const executionResult = payload.executionResult;
      const blockHash = payload.blockHash;
      const timestamp = payload.timestamp;
      
      if (!transactionHash || !executionResult) {
        return;
      }

      // Check if execution was successful (no error message means success)
      const isSuccess = !executionResult.errorMessage;
      if (!isSuccess) {
        return;
      }

      // Extract messages from the event (contract events)
      const messages = payload.messages || [];
      
      for (const message of messages) {
        // Check if this message is from our contract
        const entityAddr = message.hashAddr?.toHex?.() || '';
        if (!entityAddr || !entityAddr.includes(this.contractHash)) {
          continue;
        }

        // Parse the message data
        const messageData = message.message;
        const topicName = message.topicName || '';
        const blockIndex = message.blockIndex || 0;

        // Create a CasperEvent from the message
        const casperEvent: CasperEvent = {
          event_id: `${blockIndex}-${message.topicIndex || 0}`,
          deploy_hash: this.extractDeployHash(transactionHash),
          block_height: blockIndex,
          timestamp: timestamp?.toJSON?.() || new Date().toISOString(),
          event_type: topicName,
          data: this.parseMessageData(messageData),
        };

        // Process the event
        await this.processEvent(casperEvent);
      }
    } catch (error) {
      console.error("[EventWatcher] Error handling TransactionProcessed event:", error);
    }
  }

  /**
   * Extract deploy hash from transaction hash object
   */
  private extractDeployHash(transactionHash: any): string {
    if (typeof transactionHash === 'string') {
      return transactionHash;
    }
    if (transactionHash?.toHex) {
      return transactionHash.toHex();
    }
    if (transactionHash?.toString) {
      return transactionHash.toString();
    }
    if (transactionHash?.Version1) {
      return transactionHash.Version1;
    }
    if (transactionHash?.Deploy) {
      return transactionHash.Deploy;
    }
    return JSON.stringify(transactionHash);
  }

  /**
   * Parse message data from various formats
   */
  private parseMessageData(messageData: any): any {
    try {
      // If it's a string message, try to parse as JSON
      if (messageData?.String) {
        try {
          return JSON.parse(messageData.String);
        } catch {
          return { raw: messageData.String };
        }
      }
      
      // If it's already an object, return it
      if (typeof messageData === 'object') {
        return messageData;
      }

      // Try to parse as JSON string
      if (typeof messageData === 'string') {
        try {
          return JSON.parse(messageData);
        } catch {
          return { raw: messageData };
        }
      }

      return messageData;
    } catch (error) {
      console.error("[EventWatcher] Error parsing message data:", error);
      return { raw: messageData };
    }
  }

  /**
   * Handle stream errors and implement reconnection logic
   */
  private handleStreamError(): void {
    if (!this.isRunning) {
      return;
    }

    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error("[EventWatcher] Max reconnection attempts reached. Stopping.");
      this.stop();
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[EventWatcher] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.isRunning) {
        this.connectToStream();
      }
    }, delay);
  }

  /**
   * Process an incoming event with idempotency
   */
  async processEvent(event: CasperEvent): Promise<void> {
    console.log(`[EventWatcher] Processing event: ${event.event_id}`);

    // Check if event was already processed (idempotency)
    const existing = await ProcessedEvent.findOne({ event_id: event.event_id });
    if (existing) {
      console.log(`[EventWatcher] Event ${event.event_id} already processed, skipping`);
      return;
    }

    // Also check by deploy_hash (additional safety)
    const existingDeploy = await ProcessedEvent.findOne({ deploy_hash: event.deploy_hash });
    if (existingDeploy && existingDeploy.event_type === event.event_type) {
      console.log(`[EventWatcher] Deploy ${event.deploy_hash} already processed, skipping`);
      return;
    }

    try {
      // Process based on event type
      switch (event.event_type) {
        case "Deposit":
          await this.handleDeposit(event);
          break;
        case "UnstakeRequest":
          await this.handleUnstakeRequest(event);
          break;
        case "Withdrawal":
          await this.handleWithdrawal(event);
          break;
        case "RewardDistribution":
          await this.handleRewardDistribution(event);
          break;
        default:
          console.log(`[EventWatcher] Unknown event type: ${event.event_type}`);
      }

      // Mark event as processed
      await ProcessedEvent.create({
        deploy_hash: event.deploy_hash,
        event_type: event.event_type,
        event_id: event.event_id,
        block_height: event.block_height,
        timestamp: new Date(event.timestamp),
        public_key: event.data.public_key,
        amount: event.data.amount,
        metadata: event.data,
      });

      console.log(`[EventWatcher] Successfully processed event: ${event.event_id}`);
    }
    catch (error) {
      console.error(`[EventWatcher] Error processing event ${event.event_id}:`, error);
      throw error;
    }
  }

  /**
   * Handle Deposit event
   */
  private async handleDeposit(event: CasperEvent): Promise<void> {
    const { public_key, amount } = event.data;

    if (!amount) {
      throw new Error("Deposit event missing amount");
    }

    // Find or create treasury
    let treasury = await Treasury.findOne({ public_key });

    if (!treasury) {
      treasury = new Treasury({
        public_key,
        total_deposited: "0",
        current_balance: "0",
        pending_unstake: "0",
        pvcspr_balance: "0",
        first_deposit_date: new Date(event.timestamp),
        last_activity_date: new Date(event.timestamp),
      });
    }

    // Update balances
    const currentDeposited = BigInt(treasury.total_deposited);
    const currentBalance = BigInt(treasury.current_balance);
    const depositAmount = BigInt(amount);

    treasury.total_deposited = (currentDeposited + depositAmount).toString();
    treasury.current_balance = (currentBalance + depositAmount).toString();
    treasury.pvcspr_balance = (BigInt(treasury.pvcspr_balance) + depositAmount).toString();
    treasury.last_activity_date = new Date(event.timestamp);

    // Add transaction
    treasury.transaction_history.push({
      type: "Deposit",
      amount,
      deploy_hash: event.deploy_hash,
      timestamp: new Date(event.timestamp),
      block_height: event.block_height,
    });

    await treasury.save();

    console.log(`[EventWatcher] Deposited ${amount} motes for ${public_key}`);
  }

  /**
   * Handle UnstakeRequest event
   */
  private async handleUnstakeRequest(event: CasperEvent): Promise<void> {
    const { public_key, amount } = event.data;

    if (!amount) {
      throw new Error("UnstakeRequest event missing amount");
    }

    const treasury = await Treasury.findOne({ public_key });
    if (!treasury) {
      throw new Error(`Treasury not found for ${public_key}`);
    }

    // Move from current_balance to pending_unstake
    const currentBalance = BigInt(treasury.current_balance);
    const pendingUnstake = BigInt(treasury.pending_unstake);
    const unstakeAmount = BigInt(amount);

    if (currentBalance < unstakeAmount) {
      throw new Error("Insufficient balance for unstake request");
    }

    treasury.current_balance = (currentBalance - unstakeAmount).toString();
    treasury.pending_unstake = (pendingUnstake + unstakeAmount).toString();
    treasury.last_activity_date = new Date(event.timestamp);

    // Add transaction
    treasury.transaction_history.push({
      type: "Unstake",
      amount,
      deploy_hash: event.deploy_hash,
      timestamp: new Date(event.timestamp),
      block_height: event.block_height,
    });

    await treasury.save();

    console.log(`[EventWatcher] Unstake request ${amount} motes for ${public_key}`);
  }

  /**
   * Handle Withdrawal event
   */
  private async handleWithdrawal(event: CasperEvent): Promise<void> {
    const { public_key, amount } = event.data;

    if (!amount) {
      throw new Error("Withdrawal event missing amount");
    }

    const treasury = await Treasury.findOne({ public_key });
    if (!treasury) {
      throw new Error(`Treasury not found for ${public_key}`);
    }

    // Remove from pending_unstake
    const pendingUnstake = BigInt(treasury.pending_unstake);
    const withdrawAmount = BigInt(amount);

    if (pendingUnstake < withdrawAmount) {
      throw new Error("Insufficient pending unstake for withdrawal");
    }

    treasury.pending_unstake = (pendingUnstake - withdrawAmount).toString();
    treasury.pvcspr_balance = (BigInt(treasury.pvcspr_balance) - withdrawAmount).toString();
    treasury.last_activity_date = new Date(event.timestamp);

    // Add transaction
    treasury.transaction_history.push({
      type: "Withdrawal",
      amount,
      deploy_hash: event.deploy_hash,
      timestamp: new Date(event.timestamp),
      block_height: event.block_height,
    });

    await treasury.save();

    console.log(`[EventWatcher] Withdrawal ${amount} motes for ${public_key}`);
  }

  /**
   * Handle RewardDistribution event
   */
  private async handleRewardDistribution(event: CasperEvent): Promise<void> {
    const { public_key, amount, draw_id, rank, total_winners } = event.data as any;

    if (!amount || !draw_id) {
      throw new Error("RewardDistribution event missing required fields");
    }

    const treasury = await Treasury.findOne({ public_key });
    if (!treasury) {
      throw new Error(`Treasury not found for ${public_key}`);
    }

    // Add reward to current_balance
    const currentBalance = BigInt(treasury.current_balance);
    const rewardAmount = BigInt(amount);

    treasury.current_balance = (currentBalance + rewardAmount).toString();
    treasury.last_activity_date = new Date(event.timestamp);

    // Add transaction
    treasury.transaction_history.push({
      type: "Reward",
      amount,
      deploy_hash: event.deploy_hash,
      timestamp: new Date(event.timestamp),
      block_height: event.block_height,
    });

    // Add to reward history
    treasury.reward_history.push({
      draw_id,
      amount,
      timestamp: new Date(event.timestamp),
      rank: rank ?? 0,
      total_winners: total_winners ?? 0,
    });

    await treasury.save();

    console.log(`[EventWatcher] Reward ${amount} motes distributed to ${public_key} (Draw: ${draw_id})`);
  }

  /**
   * Replay events from a specific block height
   * Used for re-syncing after downtime
   */
  async replayEvents(fromBlock: number, toBlock?: number): Promise<void> {
    console.log(`[EventWatcher] Replaying events from block ${fromBlock} to ${toBlock ?? "latest"}`);

    try {
      // Stop current stream if running
      const wasRunning = this.isRunning;
      if (wasRunning) {
        this.stop();
      }

      // Create a temporary SSE client for replay
      const replayClient = new SseClient(this.sidecarUrl);
      
      // Subscribe to events for replay
      replayClient.subscribe(EventName.TransactionProcessedEventType, (rawEvent) => {
        try {
          const parsedEvent: SdkTransactionProcessedEvent = rawEvent.parseAsTransactionProcessedEvent();
          const blockHashStr = parsedEvent.transactionProcessedPayload?.blockHash?.toHex?.();
          
          // Stop replay if we've reached the target block
          if (toBlock && blockHashStr && parseInt(blockHashStr, 16) > toBlock) {
            replayClient.stop();
            return;
          }
          
          this.handleTransactionProcessedEvent(parsedEvent);
        } catch (error) {
          console.error("[EventWatcher] Error during replay:", error);
        }
      });

      // Start replay from the specified block
      // Note: The actual block ID mapping depends on your node's event cache
      console.log(`[EventWatcher] Starting replay from event ID corresponding to block ${fromBlock}`);
      replayClient.start(fromBlock);

      // Wait for replay to complete (in production, you'd implement proper completion detection)
      await new Promise(resolve => setTimeout(resolve, 5000));
      replayClient.stop();

      console.log("[EventWatcher] Replay complete");

      // Restart the watcher if it was running before
      if (wasRunning) {
        await this.start();
      }
    } catch (error) {
      console.error("[EventWatcher] Error during event replay:", error);
      throw error;
    }
  }
}

export const eventWatcherService = new EventWatcherService();
