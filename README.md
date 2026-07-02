# Cristóbal Merchan Farfán — Sitio Web Personal

Un sitio web personal/académico construido con **[Quarto](https://quarto.org/)**, compilado a HTML estático. Diseño editorial-brutalista de dos colores, totalmente parametrizado por tokens SCSS.

## Contenido

- **Inicio** — Introducción, bio, redes sociales (ORCID, LinkedIn, Instagram, GitHub) y tarjetas de navegación.
- **Lecturas** — Fichas de libros y textos recomendados con reseña personal, estrellas y modal de lectura completa.
- **Ensayos** — Placeholder para futuras reflexiones académicas.
- **Scripts** — Herramientas en R y Python para análisis de datos, bibliometría y visualización.
- **Recursos y Enlaces** — Selección de videos, bases de datos, podcasts, herramientas y más.

## 🛠️ Compilación

Requiere [Quarto](https://quarto.org/docs/get-started/) instalado.

```bash
# Previsualizar con recarga en vivo
quarto preview

# Compilar a docs/ (salida HTML estática)
quarto render
```

## 🎨 Personalización

Toda la estética se controla por **tokens** en un único archivo: [`theme.scss`](theme.scss).

**Cambiar la estética es tan simple como editar un token.** Documentación completa:  
→ **[`README_PERSONALIZACION.md`](README_PERSONALIZACION.md)** — Tabla de tokens, recetas comunes, cómo previsualizar.

## 📁 Estructura

```
.
├── _quarto.yml                # Configuración: tema, fuentes, Google Analytics
├── theme.scss                 # Tema por tokens (centro de personalización)
├── README_PERSONALIZACION.md  # Guía de personalización por tokens
├── index.qmd                  # Página de inicio
├── lecturas.qmd               # Reseñas de libros
├── ensayos.qmd                # Próximamente
├── scripts.qmd                # Scripts en R/Python
├── recursos.qmd               # Recursos y enlaces
├── data/
│   ├── books.json             # Datos de libros
│   ├── scripts.json           # Datos de scripts
│   ├── recursos.json          # Datos de recursos
│   └── img/                   # Imágenes (portadas, etc.)
└── docs/                      # Salida compilada (generada por Quarto)
```

## 📝 Editar contenido

- **Libros/reseñas:** `data/books.json`
- **Scripts:** `data/scripts.json`
- **Recursos:** `data/recursos.json`
- **Páginas estáticas:** archivos `.qmd` correspondientes

### Schema de los JSONs

Cada entrada incluye un campo `tags` con un array de strings temáticos:

```json
{
  "id": "...",
  "tags": ["sociología", "metodología"],
  ...
}
```

**Taxonomía temática** (extensible — puedes agregar los que necesites):

| Valores disponibles |
|---|
| `filosofía-de-la-ciencia` · `filosofía` · `teoría-social` · `sociología` · `cienciometría` · `bibliometría` · `metodología` · `bibliotecas` · `herramienta` |

> Los tags son strings libres: si ningún valor existente encaja, agrega el que necesites.
> Mantén los nombres en minúsculas y con guión (kebab-case) para consistencia en el filtro.

## 🗺️ Roadmap

Funcionalidades planificadas (ver `../LOG.md` para estado detallado):

| # | Feature | Estado |
|---|---|---|
| 0 | Mobile parity: fichas consistentes en todas las páginas en móvil | ✅ |
| 1 | Tags en JSONs: campo `tags` en los 3 JSONs | ✅ |
| 2 | Filtro UI por página: chips de tags + filtrado JS | ✅ |
| 3 | Paginación: 6 items por página | ✅ |
| 4 | Página `/explorar` + tag-cloud en Home con conteo | ✅ |

## 🔗 Enlaces

- **Autor:** [cristobal.merchan98@gmail.com](mailto:cristobal.merchan98@gmail.com)
- **Licencia:** [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
- **Tecnología:** [Quarto](https://quarto.org/) + SCSS

---

© 2026 Cristóbal Merchan Farfán. Contenido bajo [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
