import { env } from "../env.js";
import { ProcessedEvent, Treasury } from "../models/index.js";

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
  private eventSource: any = null;

  constructor(
    private sidecarUrl: string = env.CASPER_SIDECAR_URL,
    private contractHash: string = env.CONTRACT_HASH,
  ) {}

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

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    console.log("[EventWatcher] Stopped");
  }

  /**
   * STUB: Connect to SSE stream
   * In production, this would use EventSource or SSE client to connect to Casper Sidecar
   */
  private async connectToStream(): Promise<void> {
    console.log("[STUB] Connecting to Casper Sidecar SSE stream...");

    // STUB: In production, you would:
    // 1. Import EventSource from 'eventsource' package
    // 2. Connect to the Sidecar endpoint
    // 3. Filter events by contract hash
    // 4. Handle reconnection logic

    // For now, we'll simulate event processing
    console.log("[STUB] Event watcher connected (stub mode - no real events)");
    console.log("[STUB] To test event processing, use the manual deposit endpoint");

    // Keep the watcher "alive"
    this.simulateEventStream();
  }

  /**
   * STUB: Simulate event stream for testing
   */
  private simulateEventStream(): void {
    // This is just to keep the service running
    // In production, events come from the SSE stream
    const heartbeat = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(heartbeat);
        return;
      }
      console.log("[EventWatcher] Heartbeat - waiting for events...");
    }, 60000); // Every minute
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
    console.log(`[STUB] Replaying events from block ${fromBlock} to ${toBlock ?? "latest"}`);

    // STUB: In production, this would:
    // 1. Query the Casper node/sidecar for historical events
    // 2. Filter by contract hash and block range
    // 3. Process each event through processEvent()
    // 4. Handle any failures gracefully

    console.log("[STUB] Replay complete (stub mode - no actual events replayed)");
  }
}

export const eventWatcherService = new EventWatcherService();
