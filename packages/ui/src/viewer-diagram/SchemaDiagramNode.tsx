/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Schema } from '@overture-stack/lectern-dictionary';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { isFieldRequired } from '../utils/isFieldRequired';

// TODO: Colors and styling constants taken from theme instead of hardcoded

const baseFieldRowStyles = {
	padding: '8px 12px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	borderBottom: '1px solid #e2e8f0',
	transition: 'background-color 0.2s',
};

const primaryKeyRowStyles = css({
	...baseFieldRowStyles,
	backgroundColor: '#fef3c7',
	borderLeft: '4px solid #f59e0b',
});
const foreignKeyRowStyles = css({
	...baseFieldRowStyles,
	backgroundColor: '#d1fae5',
	borderLeft: '4px solid #10b981',
});
const standardKeyRowStyles = css({
	...baseFieldRowStyles,
	'&:hover': {
		backgroundColor: '#e0f2fe',
	},
	'&:last-child': {
		borderBottom: 'none',
	},
});

const fieldContentStyles = css({
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	flex: 1,
	minWidth: 0,
});

const keyIndicatorStyles = css({
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
	flexShrink: 0,
});

const primaryKeyBadgeStyles = css({
	color: '#d97706',
	fontWeight: 'bold',
	fontSize: '14px',
});

const foreignKeyBadgeStyles = css({
	color: '#059669',
	fontWeight: 'bold',
	fontSize: '14px',
});

const requiredFieldStyles = css({
	color: '#dc2626',
	fontSize: '14px',
});

const baseFieldNameStyles = css({
	fontWeight: 'bold',
	fontSize: '14px',
	color: '#1f2937',
	whiteSpace: 'nowrap' as const,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	flex: 1,
});

const primaryKeyFieldStyles = css({
	...baseFieldNameStyles,
	fontWeight: '900',
	color: '#111827',
});

const dataTypeBadgeStyles = css({
	fontSize: '12px',
	fontFamily: '"Monaco", "Consolas", "Ubuntu Mono", monospace',
	backgroundColor: '#e5e7eb',
	color: '#374151',
	padding: '4px 8px',
	borderRadius: '4px',
	flexShrink: 0,
	marginLeft: '8px',
});

/**
 * Custom Schema Node Component
 * Renders a Lectern schema as a clean, traditional ERD table
 */
export function SchemaDiagramNode(props: { data: Schema }) {
	const { data: schema } = props;

	return (
		<div
			css={css({
				background: 'white',
				border: '2px solid #6b7280',
				borderRadius: '8px',
				boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				minWidth: '280px',
				maxWidth: '350px',
				overflow: 'hidden',
			})}
		>
			{/* Schema name header - prominent ERD style */}
			<div
				css={css({
					background: 'linear-gradient(to right, #1e293b, #334155)',
					color: 'white',
					padding: '16px 24px',
					textAlign: 'center',
					borderBottom: '2px solid #6b7280',
					fontWeight: '900',
					fontSize: '20px',
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					margin: 0,
				})}
			>
				{/* <div
					css={css({
						fontWeight: '900',
						fontSize: '20px',
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						margin: 0,
					})}
				> */}
				{schema.name}
				{/* </div> */}
			</div>

			{/* Fields list - table-like appearance */}
			<div css={css({ background: '#f8fafc' })}>
				{schema.fields.map((field, index) => {
					const isRequired = isFieldRequired(field);

					const isUniqueKey = schema.restrictions?.uniqueKey?.includes(field.name) || false;
					const isForeignKey =
						schema.restrictions?.foreignKey?.some((fk) =>
							fk.mappings.some((mapping) => mapping.local === field.name),
						) || false;
					const rowStyles =
						isUniqueKey ? primaryKeyRowStyles
						: isForeignKey ? foreignKeyRowStyles
						: standardKeyRowStyles;

					const valueType = field.isArray ? `${field.valueType}[]` : field.valueType;

					return (
						<div key={index} css={rowStyles}>
							<div css={fieldContentStyles}>
								{/* Key indicators */}
								<div css={keyIndicatorStyles}>
									{isUniqueKey && (
										<span css={primaryKeyBadgeStyles} title="Primary Key">
											UK
										</span>
									)}
									{isForeignKey && (
										<span css={foreignKeyBadgeStyles} title="Foreign Key">
											FK
										</span>
									)}
									{isRequired && (
										<span css={requiredFieldStyles} title="Required">
											*
										</span>
									)}
								</div>

								{/* Field name */}
								<span css={isUniqueKey ? primaryKeyFieldStyles : baseFieldNameStyles}>{field.name}</span>
							</div>

							{/* Data type badge */}
							<span css={dataTypeBadgeStyles}>{valueType}</span>
						</div>
					);
				})}
			</div>

			{/* Connection handles - minimal and clean */}
			<Handle
				id="target-left"
				type="target"
				position={Position.Left}
				style={{
					background: 'transparent',
					border: 'none',
					width: 8,
					height: 8,
				}}
			/>
			<Handle
				id="source-right"
				type="source"
				position={Position.Right}
				style={{
					background: 'transparent',
					border: 'none',
					width: 8,
					height: 8,
				}}
			/>
		</div>
	);
}
