import { sanity } from "../lib.js";

export const dynamic = "force-dynamic";

export default async function Home() {
	const posts = await sanity.fetch(`*[_type == "post" && defined(title)] | order(_updatedAt desc){ _id, title }`);
	return (
		<>
			<h1>Posts</h1>
			<ul className="posts">
				{posts.map((p) => (
					<li key={p._id}>
						<a href={`/posts/${p._id.replace(/^drafts\./, "")}`}>{p.title}</a>
					</li>
				))}
			</ul>
		</>
	);
}
