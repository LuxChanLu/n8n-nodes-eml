import { IExecuteFunctions } from 'n8n-core';

import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

// @ts-ignore
import EmlParser from 'eml-parser';
import { Readable } from 'stream';

export class Eml implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Emal',
		name: 'eml',
		icon: 'file:eml.svg',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		group: ['transform'],
		version: 1,
		description: 'Manipulate EML',
		defaults: {
			name: 'Eml',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'EML Input',
				name: 'rawEml',
				type: 'string',
				description: 'Raw EML data',
				required: true,
				default: '',
			},
			{
				displayName: 'Base64 Input',
				name: 'base64Input',
				type: 'boolean',
				default: true,
				description: 'Whether the input is base64 or not',
			},
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const base64Input = this.getNodeParameter('base64Input', 0) as boolean;

		for (let i = 0; i < items.length; i++) {
			const rawEml = base64Input
				? Buffer.from(this.getNodeParameter('rawEml', i) as string, 'base64').toString('utf8')
				: (this.getNodeParameter('rawEml', i) as string);
			const parser = new EmlParser(Readable.from(rawEml));

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray((await parser.getEmailAttachments()) as IDataObject[]),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		}

		return this.prepareOutputData(returnData);
	}
}
