import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_IMAGES_DIR = "C:\\Users\\DESARROLLOS\\Documents\\Imagenes-Propuestas";
const IMAGES_DIR = process.env.IMAGENES_PROPUESTAS_DIR || DEFAULT_IMAGES_DIR;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
};

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim();
  const normalized = trimmed.replace(/\\/g, "/");
  const basename = path.posix.basename(normalized);

  if (!trimmed || basename !== normalized) {
    return null;
  }

  return basename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildStoredFilename(originalName: string) {
  const safeName = sanitizeFilename(originalName) || "imagen";
  const extension = path.extname(safeName);
  const baseName = path.basename(safeName, extension) || "imagen";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${baseName}-${uniqueSuffix}${extension}`;
}

function getMimeType(filename: string) {
  return MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream";
}

async function ensureImagesDir() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    await ensureImagesDir();

    const formData = await req.formData();
    const uploadedFile = formData.get("file") || formData.get("image") || formData.get("imagen");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Debes enviar un archivo en form-data con la llave file, image o imagen" },
        { status: 400 }
      );
    }

    if (!uploadedFile.size) {
      return NextResponse.json(
        { ok: false, error: "El archivo esta vacio" },
        { status: 400 }
      );
    }

    const storedFilename = buildStoredFilename(uploadedFile.name);
    const filePath = path.join(IMAGES_DIR, storedFilename);
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    return NextResponse.json(
      {
        ok: true,
        data: {
          filename: storedFilename,
          originalName: uploadedFile.name,
          size: uploadedFile.size,
          contentType: uploadedFile.type || getMimeType(storedFilename),
          path: filePath,
          url: `/api/imagenes?filename=${encodeURIComponent(storedFilename)}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureImagesDir();

    const { searchParams } = new URL(req.url);
    const filenameParam = searchParams.get("filename");

    if (!filenameParam) {
      const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
      const files = await Promise.all(
        entries
          .filter((entry) => entry.isFile())
          .map(async (entry) => {
            const filePath = path.join(IMAGES_DIR, entry.name);
            const stats = await fs.stat(filePath);

            return {
              filename: entry.name,
              size: stats.size,
              updatedAt: stats.mtime.toISOString(),
              url: `/api/imagenes?filename=${encodeURIComponent(entry.name)}`,
            };
          })
      );

      files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      return NextResponse.json({
        ok: true,
        data: {
          directory: IMAGES_DIR,
          total: files.length,
          files,
        },
      });
    }

    const safeFilename = sanitizeFilename(filenameParam);
    if (!safeFilename) {
      return NextResponse.json({ ok: false, error: "Nombre de archivo invalido" }, { status: 400 });
    }

    const filePath = path.join(IMAGES_DIR, safeFilename);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": getMimeType(safeFilename),
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ ok: false, error: "Imagen no encontrada" }, { status: 404 });
    }

    console.error("Error al leer imagen:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
