import {
	IExpression,
	IJSONExpressionData,
	execJSONExpression,
} from "../../../jsonexpression";
import { IObjectProperty } from ".";
import { IFlowOptions } from "../..";
import { unset } from "../../../helper/immutable";

export type IObjectIfBlock = {
	type: "if";
	blockId?: string;
	cond: IExpression;
	true: IObjectProperty[];
	false?: IObjectProperty[];
};

export const ifLogic = (
	config: IObjectIfBlock,
	data: IJSONExpressionData<any, any>,
	options?: IFlowOptions
) => {
	const cond = !!execJSONExpression(config.cond, data);
	if (options?.enforceSchema) {
		if (cond) {
			// delete false fields.
			config.false?.forEach((v) => {
				if (!config.true.find((v) => v.key === v.key)) {
					data.data = unset(
						data.data,
						data.refPath ? [...data.refPath, v.key] : [v.key]
					);
				}
			});
		} else {
			// delete true fields.
			config.true.forEach((v) => {
				if (!config.true.find((v) => v.key === v.key)) {
					data.data = unset(
						data.data,
						data.refPath ? [...data.refPath, v.key] : [v.key]
					);
				}
			});
		}
	}
	const flow = cond ? config.true : config.false;
	return flow;
};

export type IObjectSwitchBlock = {
	type: "switch";
	blockId?: string;
	cond: IExpression;
	cases: {
		[key: string]: IObjectProperty[];
	};
};

export const switchLogic = (
	config: IObjectSwitchBlock,
	data: IJSONExpressionData<any, any>,
	options?: IFlowOptions
) => {
	const cond = execJSONExpression(config.cond, data) as string;
	if (options?.enforceSchema) {
		// Delete keys of other cases.
		for (const v of Object.keys(config.cases)) {
			if (v !== cond) {
				config.cases[v].forEach((prop) => {
					const keyArray = data.refPath
						? [...data.refPath, prop.key]
						: [prop.key];
					return unset(data.data, keyArray);
				});
			}
		}
	}
	return config.cases[cond];
};
