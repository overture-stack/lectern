/** @jsxImportSource @emotion/react */
import React from 'react';
import Eye from '../../../theme/icons/Eye';
import Pill from '../../../common/Pill';
export type OpenModalButtonProps = {
	title: string;
};
const OpenModalPill = ({ title }: OpenModalButtonProps) => {
	return <Pill icon={<Eye width={15} height={15} />}>{title}</Pill>;
};
export default OpenModalPill;
