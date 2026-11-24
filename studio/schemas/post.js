import { defineArrayMember, defineField, defineType } from "sanity";

/** A blog post: the AVDEB objects sit between paragraphs in Portable Text. */
export const post = defineType({
	name: "post",
	title: "Post",
	type: "document",
	fields: [
		defineField({ name: "title", title: "Title", type: "string" }),
		defineField({
			name: "body",
			title: "Body",
			type: "array",
			of: [
				defineArrayMember({ type: "block" }),
				defineArrayMember({ type: "avdebProducts" }),
				defineArrayMember({ type: "avdebProduct" }),
				defineArrayMember({ type: "avdebButton" }),
			],
		}),
	],
});
