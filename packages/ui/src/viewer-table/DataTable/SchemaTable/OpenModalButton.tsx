/** @jsxImportSource @emotion/react */
import React from 'react';
import Button from '../../../common/Button';
import Eye from '../../../theme/icons/Eye';
import { css } from '@emotion/react';
export type OpenModalButtonProps = {
	title: string;
};
const OpenModalButton = ({ title }: OpenModalButtonProps) => {
	return <Button icon={<Eye />}>{title}</Button>;
};
export default OpenModalButton;
