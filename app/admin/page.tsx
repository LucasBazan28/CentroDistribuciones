import Link from "next/dist/client/link";

export default function AdminPage() {
  return (
    <main>
        <h1>Admin Page</h1>
        <p>THIS IS THE ADMIN PAGE</p>

        <Link href="/admin/newProduct">
          Go to New Product
        </Link>
    </main>
  );
}