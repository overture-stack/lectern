/** @jsxImportSource @emotion/react */
import { SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import Pill from '../../../../common/Pill';
import OpenModalButton from '../OpenModalButton';
export type Attributes = 'Required' | 'Optional' | 'Required When';

export const renderAttributesColumn = (schemaRestrictions: SchemaRestrictions | undefined) => {
	//TODO: Implement this when specs next week arrive.
	const handleRequiredWhen = () => {
		return <OpenModalButton title="Required When" />;
	};
	if (schemaRestrictions && 'if' in schemaRestrictions && schemaRestrictions.if) {
		return handleRequiredWhen();
	}
	return (
		<Pill>
			{schemaRestrictions && 'required' in schemaRestrictions && schemaRestrictions.required ? 'Required' : 'Optional'}
		</Pill>
	);
};
