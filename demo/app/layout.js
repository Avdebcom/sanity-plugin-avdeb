import "sanity-plugin-avdeb/avdeb.css";
import "./site.css";

export const metadata = { title: "Maker Notes" };

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<header className="site-header">
					<a href="/">Maker Notes</a>
					<nav>
						<a href="/">Posts</a>
						<a href="/">About</a>
					</nav>
				</header>
				<main>{children}</main>
			</body>
		</html>
	);
}
