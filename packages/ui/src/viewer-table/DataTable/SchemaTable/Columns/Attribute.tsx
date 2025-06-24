/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import Pill from '../../../../common/Pill';
import OpenModalButton from '../OpenModalPill';

export type Attributes = 'Required' | 'Optional' | 'Required When';

const containerStyle = css`
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 10px;
`;
export const renderAttributesColumn = (schemaRestrictions: SchemaRestrictions | undefined) => {
	//TODO: Implement this when specs next week arrive.
	const handleRequiredWhen = () => {
		return <OpenModalButton title="Required When" />;
	};
	if (schemaRestrictions && 'if' in schemaRestrictions && schemaRestrictions.if) {
		return handleRequiredWhen();
	}
	return (
		<div css={containerStyle}>
			<Pill dark={true}>
				{schemaRestrictions && 'required' in schemaRestrictions && schemaRestrictions.required ?
					'Required'
				:	'Optional'}
			</Pill>
		</div>
	);
};
