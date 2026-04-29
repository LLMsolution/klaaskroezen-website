"use client";

export type OrdersFilterState = {
  product: string[];
  productLogic: "or" | "and";
  startDate: string;
  endDate: string;
  nameQuery: string;
  minQuantity: string;
  maxQuantity: string;
};

const LABEL = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
const INPUT = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none rounded-[2px]";

export function OrdersFilterPanel({
  value,
  onChange,
  productOptions,
  productLabels,
  totalCount,
  filteredCount,
}: {
  value: OrdersFilterState;
  onChange: (next: OrdersFilterState) => void;
  productOptions: string[];
  productLabels: Record<string, string>;
  totalCount: number;
  filteredCount: number;
}) {
  function update<K extends keyof OrdersFilterState>(key: K, val: OrdersFilterState[K]) {
    onChange({ ...value, [key]: val });
  }

  function toggleProduct(slug: string) {
    const next = value.product.includes(slug)
      ? value.product.filter((s) => s !== slug)
      : [...value.product, slug];
    onChange({ ...value, product: next });
  }

  const hasFilters =
    value.product.length > 0 ||
    !!value.startDate || !!value.endDate ||
    !!value.nameQuery ||
    !!value.minQuantity || !!value.maxQuantity;

  return (
    <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto border border-rule rounded-[2px] p-4 bg-warm/10">
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Filters</p>
        <p className="text-[12px] text-ink/50 mt-1">
          {filteredCount} van {totalCount}
        </p>
      </div>

      <div>
        <label className={LABEL}>Periode</label>
        <div className="space-y-2">
          <input
            type="date"
            value={value.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={INPUT}
          />
          <input
            type="date"
            value={value.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Naam, email, bedrijf</label>
        <input
          type="text"
          value={value.nameQuery}
          onChange={(e) => update("nameQuery", e.target.value)}
          placeholder="Zoek..."
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Aantal</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={value.minQuantity}
            onChange={(e) => update("minQuantity", e.target.value)}
            placeholder="Min"
            className={INPUT}
          />
          <input
            type="number"
            min="0"
            value={value.maxQuantity}
            onChange={(e) => update("maxQuantity", e.target.value)}
            placeholder="Max"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Product</label>
        <div className="space-y-1.5">
          {productOptions.length === 0 ? (
            <p className="text-[12px] text-ink/30">Geen producten</p>
          ) : productOptions.map((slug) => (
            <label key={slug} className="flex items-center gap-2 cursor-pointer text-[13px] text-ink/70 hover:text-ink">
              <input
                type="checkbox"
                checked={value.product.includes(slug)}
                onChange={() => toggleProduct(slug)}
                className="w-3.5 h-3.5 accent-copper cursor-pointer"
              />
              {productLabels[slug] || slug}
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({
            product: [],
            productLogic: "or",
            startDate: "",
            endDate: "",
            nameQuery: "",
            minQuantity: "",
            maxQuantity: "",
          })}
          className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
        >
          Filters wissen
        </button>
      )}
    </aside>
  );
}
