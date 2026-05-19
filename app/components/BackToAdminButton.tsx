import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BackToAdminButton() {
    return(
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
            >
            <ArrowLeft className="h-4 w-4" />
              Volver al Admin
          </Link>
        </div>
    )
}