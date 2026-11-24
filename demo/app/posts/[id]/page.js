import { PortableText } from "@portabletext/react";
import { avdebComponents } from "sanity-plugin-avdeb/react";

import { avdeb, sanity } from "../../../lib.js";

export const dynamic = "force-dynamic";

export default async function Post({ params }) {
	const { id } = await params;
	const post = await sanity.fetch(`*[_type == "post" && _id == $id][0]{ title, body }`, { id });
	if (!post) return <h1>Not found</h1>;
	return (
		<article>
			<h1>{post.title}</h1>
			<p className="meta">A gift guide · 4 min read</p>
			<PortableText value={post.body ?? []} components={avdebComponents(avdeb)} />
		</article>
	);
}
