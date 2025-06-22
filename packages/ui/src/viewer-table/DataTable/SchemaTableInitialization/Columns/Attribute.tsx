/** @jsxImportSource @emotion/react */
import { SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import Pill from '../../../../common/Pill';

export type Attributes = 'Required' | 'Optional' | 'Required When';

export const renderAttributesColumn = (schemaRestrictions: SchemaRestrictions | undefined) => {
	//TODO: Implement this when specs next week arrive.
	const handleRequiredWhen = () => {
		return <div> Conditional Restrictions</div>;
	};
	return (
		<Pill>
			{schemaRestrictions && 'required' in schemaRestrictions && schemaRestrictions.required ?
				'Required'
			: schemaRestrictions && 'if' in schemaRestrictions && schemaRestrictions.if ?
				handleRequiredWhen()
			:	'Optional'}
		</Pill>
	);
};
