import { defineArrayMember, defineField, defineType } from "sanity";

/** A page builder: AVDEB objects as sections. */
export const page = defineType({
	name: "page",
	title: "Page",
	type: "document",
	fields: [
		defineField({ name: "title", title: "Title", type: "string" }),
		defineField({
			name: "sections",
			title: "Sections",
			type: "array",
			of: [
				defineArrayMember({ type: "avdebProducts" }),
				defineArrayMember({ type: "avdebProduct" }),
				defineArrayMember({ type: "avdebButton" }),
			],
		}),
	],
});
