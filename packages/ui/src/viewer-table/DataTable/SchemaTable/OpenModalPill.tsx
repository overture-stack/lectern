/** @jsxImportSource @emotion/react */
import React from 'react';
import Pill from '../../../common/Pill';
import Eye from '../../../theme/icons/Eye';
export type OpenModalButtonProps = {
	title: string;
};
const OpenModalPill = ({ title }: OpenModalButtonProps) => {
	return (
		<Pill
			size={title === 'Required When' ? 'medium' : 'extra-small'}
			variant={title === 'Required When' || 'Primary Key' || 'Foreign Key' ? 'button' : 'default'}
			icon={<Eye width={15} height={15} />}
		>
			{title}
		</Pill>
	);
};
export default OpenModalPill;
