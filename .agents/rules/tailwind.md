---
trigger: always_on
---

# Tailwind CSS & Frontend Rules

Zbiór zasad dotyczących pisania kodu CSS i komponentów w tym projekcie. Agent musi stosować się do poniższych wytycznych przy każdej edycji plików.

## 1. Standardy Tailwind CSS

- **Kolejność klas:** Stosuj spójną hierarchię klas (tzw. "Prettier Plugin Tailwind" style):
  1. Layout (position, z-index, display, flex/grid)
  2. Box Model (width, height, margin, padding)
  3. Typography (font, text-size, color, alignment)
  4. Visuals (background, border, shadow, opacity)
  5. Interactions & States (hover, focus, active, disabled)
  6. Responsive Design (sm:, md:, lg:, xl:)
- **Mobile-First:** Zawsze buduj widok podstawowy dla Mobile, a następnie używaj breakpointów (np. `md:flex-row`) dla większych ekranów.
- **Unikaj @apply:** Nie twórz klas w plikach CSS przy użyciu `@apply`. Jeśli styl się powtarza, stwórz reużywalny komponent UI.
- **Arbitrary Values:** Używaj wartości w nawiasach kwadratowych (np. `w-[13px]`) tylko w ostateczności. Preferuj standardową skalę spacingu.

## 2. Dynamiczne Klasy i Logika

- **Zasada Pełnych Nazw:** Nigdy nie konstruuj klas dynamicznie, np. `text-${color}-500`. Zawsze używaj pełnych nazw klas w obiektach mapujących lub warunkach, aby PurgeCSS/Tailwind JIT mógł je wykryć.
- **Biblioteki Pomocnicze:** Do łączenia klas warunkowych używaj funkcji `cn()` (opartej na `clsx` i `tailwind-merge`).
  - _Przykład:_ `className={cn("px-4 py-2", active && "bg-blue-500")}`

## 3. Komponenty UI

- **Dekopozycja:** Jeśli komponent przekracza 50 linii kodu ze względu na klasy Tailwind, wydziel mniejsze pod-komponenty.
- **Dostępność (A11y):** Każdy interaktywny element musi mieć zdefiniowane stany `focus-visible:outline-none focus-visible:ring-2`.
- **Dark Mode:** Każdy komponent musi obsługiwać wariant `dark:`.

## 4. Konfiguracja

- **Design System:** Zawsze sprawdzaj `tailwind.config.js` przed sugerowaniem nowych kolorów lub fontów. Trzymaj się zdefiniowanej palety barw.
- **Custom Animations:** Złożone animacje definiuj w konfiguracji Tailwinda, a w kodzie używaj tylko klas `animate-custom-name`.

## 5. Czystość Kodu (DX)

- Unikaj inline styles `style={{...}}`. Wszystko, co możliwe, realizuj przez klasy Tailwinda.
- Używaj `gap` zamiast `margin` wewnątrz kontenerów `flex` i `grid`.
