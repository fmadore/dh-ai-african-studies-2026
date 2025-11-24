declare module 'citation-js' {
	export default class Cite {
		constructor(data: any, options?: any);
		data: any[];
		format(format: string, options?: any): string;
		static async(data: any, options?: any): Promise<Cite>;
	}
}
