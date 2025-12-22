import {
	CopyHashMenuItem,
	AccountCardMenuItem,
} from '@make-software/csprclick-ui';
import { AccountMenuItem as CsprClickAccountMenuItem } from '@make-software/csprclick-ui';
import CupIcon from '../../../../assets/icons/cup.svg';


// const AccountMenuItem = () => {

// 	return (
// 		<CsprClickAccountMenuItem
// 			key={2}
// 			onClick={navigateToMyPlays}
// 			icon={CupIcon}
// 			label={'My plays'}
// 		/>
// 	);
// };
export const accountMenuItems = [
	<AccountCardMenuItem key={0} />,
	<CopyHashMenuItem key={1} />,
	// <AccountMenuItem key={2} />,
];