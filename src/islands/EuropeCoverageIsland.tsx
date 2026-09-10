import React from "react";
import { europeCoverage } from "@/data/europe-coverage";
import type { StayRule, StayRuleNote } from "@/data/europe-coverage";
import { europeMap } from "@/data/europe-map";
import type { EuropeMapRegion } from "@/data/europe-map";
import "./EuropeCoverageIsland.css";

/**
 * SSR-safe React island: the SVG and complete coverage list render without JS.
 * All geometry is local. No API key, geolocation, tiles, CDN or runtime fetch.
 * Native pointer listeners provide dragging without a gesture dependency.
 */

const regions = europeMap.regions;
const byId = new Map(regions.map((region) => [region.id, region]));
const schengenCodes = new Set(europeCoverage.schengen.map((country) => country.code));
const supportedCount = europeCoverage.schengen.length + europeCoverage.supported.length;

// Rules are presentation data only. Sharing a rule definition never pools
// allowances across countries; only Schengen is one compliance region.
const stayRules = new Map(Object.entries(europeCoverage.stayRules));
const ruleByRegion = new Map<string, StayRule | undefined>([
  ["schengen", stayRules.get(europeCoverage.schengenStayRule)],
  ...europeCoverage.supported.map(
    (country): [string, StayRule | undefined] => [country.code, stayRules.get(country.stayRule)],
  ),
]);
const ruleNotes = new Map<string, StayRuleNote>(Object.entries(europeCoverage.stayRuleNotes));

const ruleTypeLabel = (rule: StayRule) => (rule.type === "rolling-window" ? "Rolling window" : "Per visit");
const ruleLabel = (rule: StayRule) =>
  "windowDays" in rule
    ? `${rule.maxStayDays} days in any ${rule.windowDays} days`
    : `${rule.maxStayDays} days per visit`;
const ruleAccessibilityLabel = (regionId: string) => {
  const rule = ruleByRegion.get(regionId);
  return rule ? `, visa-free rule overview: up to ${ruleLabel(rule)}, ${ruleTypeLabel(rule).toLowerCase()}` : "";
};

interface ViewState {
  zoom: number;
  x: number;
  y: number;
}

const initialView: ViewState = { zoom: 1, x: 0, y: 0 };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const regionIdFor = (code: string) => (schengenCodes.has(code) ? "schengen" : code);
const statusText = (status: EuropeMapRegion["status"]) =>
  status === "unsupported" ? "Not yet supported" : "Supported by the app";

function boundedView(view: ViewState): ViewState {
  const zoom = clamp(view.zoom, 1, 4);
  return {
    zoom,
    x: clamp(view.x, europeMap.width * (1 - zoom), 0),
    y: clamp(view.y, europeMap.height * (1 - zoom), 0),
  };
}

interface EuropeCoverageIslandProps {
  id?: string;
  calculatorHref?: string;
}

interface EuropeCoverageIslandState {
  ready: boolean;
  selectedCountry: string;
  hoveredId: string | null;
  focusedId: string | null;
  dragging: boolean;
  view: ViewState;
}

interface DragState {
  pointerId: number;
  start: [number, number];
  view: ViewState;
  moved: boolean;
}

export class EuropeCoverageIsland extends React.Component<EuropeCoverageIslandProps, EuropeCoverageIslandState> {
  state: EuropeCoverageIslandState = {
    ready: false,
    selectedCountry: "schengen",
    hoveredId: null,
    focusedId: null,
    dragging: false,
    view: initialView,
  };

  private svg: SVGSVGElement | null = null;
  private drag: DragState | null = null;
  private suppressClick = false;
  private suppressionTimer?: ReturnType<typeof setTimeout>;

  private select = (countryCode: string) => {
    if (!byId.has(regionIdFor(countryCode))) return;
    this.setState({ selectedCountry: countryCode, hoveredId: null, focusedId: null });
  };

  private pointFromEvent = (event: PointerEvent): [number, number] | null => {
    const matrix = this.svg?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return [point.x, point.y];
  };

  private onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || this.state.view.zoom <= 1) return;
    const start = this.pointFromEvent(event);
    if (start) this.drag = { pointerId: event.pointerId, start, view: this.state.view, moved: false };
  };

  private onPointerMove = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = this.pointFromEvent(event);
    if (!point) return;
    const dx = point[0] - drag.start[0];
    const dy = point[1] - drag.start[1];
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      this.svg?.setPointerCapture(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
    this.setState({
      dragging: true,
      hoveredId: null,
      view: boundedView({ ...drag.view, x: drag.view.x + dx, y: drag.view.y + dy }),
    });
  };

  private finishDrag = (event: PointerEvent, cancelled: boolean) => {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const moved = this.drag.moved;
    this.drag = null;
    if (this.svg?.hasPointerCapture(event.pointerId)) this.svg.releasePointerCapture(event.pointerId);
    this.suppressClick = moved && !cancelled;
    clearTimeout(this.suppressionTimer);
    // The click immediately following pointerup must not select a country.
    this.suppressionTimer = setTimeout(() => {
      this.suppressClick = false;
    }, 0);
    this.setState({ dragging: false });
  };

  private onPointerUp = (event: PointerEvent) => this.finishDrag(event, false);
  private onPointerCancel = (event: PointerEvent) => this.finishDrag(event, true);

  private zoom = (factor: number) => {
    const center = this.activeRegion.center;
    this.setState(({ view }) => {
      const zoom = clamp(view.zoom * factor, 1, 4);
      if (zoom === 1) return { view: initialView };
      const ratio = zoom / view.zoom;
      // The first zoom targets the selected/previewed region, useful for the
      // Balkans and Cyprus. Later steps preserve the current viewport centre.
      const x =
        view.zoom === 1
          ? europeMap.width / 2 - center[0] * zoom
          : europeMap.width / 2 + (view.x - europeMap.width / 2) * ratio;
      const y =
        view.zoom === 1
          ? europeMap.height / 2 - center[1] * zoom
          : europeMap.height / 2 + (view.y - europeMap.height / 2) * ratio;
      return { view: boundedView({ zoom, x, y }) };
    });
  };

  private resetView = () => this.setState({ view: initialView });

  private onMapKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "Escape") {
      this.setState({ hoveredId: null, focusedId: null });
      return;
    }
    if (event.target !== event.currentTarget) return;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      this.zoom(1.5);
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      this.zoom(1 / 1.5);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.resetView();
      return;
    }
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [80, 0],
      ArrowRight: [-80, 0],
      ArrowUp: [0, 80],
      ArrowDown: [0, -80],
    };
    const offset = offsets[event.key];
    if (offset && this.state.view.zoom > 1) {
      event.preventDefault();
      this.setState(({ view }) => ({
        view: boundedView({ ...view, x: view.x + offset[0], y: view.y + offset[1] }),
      }));
    }
  };

  private renderRegion = (region: EuropeMapRegion) => (
    <g
      key={region.id}
      className={`evc-map__region evc-map__region--${region.status}`}
      data-region={region.id}
      data-active={this.activeId === region.id || undefined}
      role="button"
      tabIndex={this.state.ready ? 0 : -1}
      aria-label={`${region.name}: ${statusText(region.status)}${
        region.id === "schengen" ? `, ${europeCoverage.schengen.length} countries in one region` : ""
      }${ruleAccessibilityLabel(region.id)}`}
      aria-pressed={this.selectedId === region.id}
      aria-controls={`${this.props.id ?? "europe-coverage"}-detail`}
      onMouseEnter={() => {
        if (this.state.ready && !this.state.dragging) this.setState({ hoveredId: region.id });
      }}
      onMouseLeave={() => {
        if (this.state.hoveredId === region.id) this.setState({ hoveredId: null });
      }}
      onFocus={() => this.setState({ focusedId: region.id })}
      onBlur={() => this.setState({ focusedId: null })}
      onClick={() => {
        if (this.state.ready) this.select(region.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          this.select(region.id);
        }
      }}
    >
      {region.path && (
        <path className="evc-map__shape" d={region.path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
      )}
      {region.markers.map((marker) => (
        <circle
          key={marker.name}
          className="evc-map__shape evc-map__marker"
          cx={marker.point[0]}
          cy={marker.point[1]}
          r={region.status === "unsupported" ? 3.7 : 3.1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );

  componentDidMount() {
    this.svg?.addEventListener("pointerdown", this.onPointerDown);
    this.svg?.addEventListener("pointermove", this.onPointerMove, { passive: false });
    this.svg?.addEventListener("pointerup", this.onPointerUp);
    this.svg?.addEventListener("pointercancel", this.onPointerCancel);
    this.setState({ ready: true }, () => {
      // SVG attributes are case-sensitive. Normalizing here also supports
      // older React renderers that emit tabIndex rather than tabindex.
      this.svg?.setAttribute("tabindex", "0");
      this.svg?.querySelectorAll('[role="button"]').forEach((element) => {
        element.setAttribute("tabindex", "0");
      });
    });
  }

  componentWillUnmount() {
    this.svg?.removeEventListener("pointerdown", this.onPointerDown);
    this.svg?.removeEventListener("pointermove", this.onPointerMove);
    this.svg?.removeEventListener("pointerup", this.onPointerUp);
    this.svg?.removeEventListener("pointercancel", this.onPointerCancel);
    clearTimeout(this.suppressionTimer);
  }

  private get selectedId() {
    return regionIdFor(this.state.selectedCountry);
  }

  private get activeId() {
    return this.state.hoveredId ?? this.state.focusedId ?? this.selectedId;
  }

  private get activeRegion() {
    return byId.get(this.activeId) ?? regions[0];
  }

  render() {
    const id = this.props.id ?? "europe-coverage";
    const region = this.activeRegion;
    const isSchengen = region.id === "schengen";
    const stayRule = ruleByRegion.get(region.id);
    const ruleNote = ruleNotes.get(region.id);
    const isSupported = region.status !== "unsupported";
    const isPreview = this.activeId !== this.selectedId;
    const { view, ready } = this.state;

    return (
      <div className="evc-map" data-ready={ready}>
        <div className="evc-map__topbar">
          <div className="evc-map__legend" aria-label="Map legend">
            <span>
              <i className="evc-map__swatch evc-map__swatch--schengen" aria-hidden="true" />
              Schengen
            </span>
            <span>
              <i className="evc-map__swatch evc-map__swatch--supported" aria-hidden="true" />
              Also supported
            </span>
            <span>
              <i className="evc-map__swatch evc-map__swatch--unsupported" aria-hidden="true" />
              Not yet supported
            </span>
          </div>
          <span className="evc-map__total">{supportedCount} countries covered</span>
        </div>

        <div className="evc-map__layout">
          <div className="evc-map__canvas">
            <svg
              ref={(element) => {
                this.svg = element;
              }}
              viewBox={`0 0 ${europeMap.width} ${europeMap.height}`}
              className="evc-map__svg"
              data-zoomed={view.zoom > 1 || undefined}
              data-dragging={this.state.dragging || undefined}
              role="group"
              tabIndex={ready ? 0 : -1}
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-instructions`}
              onKeyDown={this.onMapKeyDown}
              onMouseLeave={() => this.setState({ hoveredId: null })}
              onClickCapture={(event) => {
                if (this.suppressClick) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
            >
              <title id={`${id}-title`}>Europe app coverage map</title>
              <desc>
                Schengen is a single selectable region. Supported non-Schengen countries use their own compliance
                rules. Grey, hatched regions are not yet supported. Use the country picker as an alternative.
              </desc>
              <defs>
                <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                  <rect width="8" height="8" fill="#e1e6e9" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd3d9" strokeWidth="1.2" />
                </pattern>
              </defs>
              <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
                <path d={europeMap.contextPath} className="evc-map__context" fillRule="evenodd" aria-hidden="true" />
                {regions.filter((item) => item.status !== "unsupported").map(this.renderRegion)}
                <g style={{ fill: `url(#${id}-hatch)` }}>
                  {regions.filter((item) => item.status === "unsupported").map(this.renderRegion)}
                </g>
                <g className="evc-map__labels" aria-hidden="true">
                  {europeMap.labels.map((label) => (
                    <text
                      key={label.text}
                      x={label.point[0]}
                      y={label.point[1]}
                      textAnchor="middle"
                      className={`evc-map__label evc-map__label--${label.kind}`}
                      data-schengen={label.regionId === "schengen" || undefined}
                    >
                      {label.text}
                    </text>
                  ))}
                </g>
              </g>
            </svg>
            <div className="evc-map__zoom" role="group" aria-label="Map zoom controls">
              <button type="button" onClick={() => this.zoom(1.5)} disabled={!ready || view.zoom >= 4} aria-label="Zoom in">
                +
              </button>
              <span aria-live="polite" aria-atomic="true">
                {Math.round(view.zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => this.zoom(1 / 1.5)}
                disabled={!ready || view.zoom <= 1}
                aria-label="Zoom out"
              >
                &minus;
              </button>
              <button
                type="button"
                className="evc-map__reset"
                onClick={this.resetView}
                disabled={!ready || view.zoom === 1}
                aria-label="Reset map view"
              >
                Reset
              </button>
            </div>
            <p className="evc-map__canvas-hint" id={`${id}-instructions`}>
              {ready ? "Hover to explore. Click or tap to select." : "Interactive controls load when the map is visible."}
              <span> Zoom, then drag to pan. With the map focused, use + / - to zoom, arrow keys to pan, and Home to reset.</span>
            </p>
          </div>

          <aside className="evc-map__sidebar" aria-label="Explore coverage">
            <div className="evc-map__picker">
              <label htmlFor={`${id}-country`}>Find a country</label>
              <select
                id={`${id}-country`}
                value={this.state.selectedCountry}
                disabled={!ready}
                onChange={(event) => this.select(event.target.value)}
              >
                <option value="schengen">Schengen area ({europeCoverage.schengen.length} countries)</option>
                <optgroup label="Schengen - supported as one region">
                  {europeCoverage.schengen.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Also supported">
                  {europeCoverage.supported.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Not yet supported">
                  {europeCoverage.unsupported.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div id={`${id}-detail`} className="evc-map__detail" data-status={region.status}>
              <p className="evc-map__eyebrow">{isPreview ? "Preview - select to keep" : "Selected destination"}</p>
              <div aria-live="polite" aria-atomic="true">
                <h3>{region.name}</h3>
                <p className={`evc-map__status evc-map__status--${isSupported ? "yes" : "no"}`}>
                  <span aria-hidden="true">{isSupported ? "✓" : "—"}</span> {statusText(region.status)}
                </p>
                {stayRule && (
                  <div className="evc-map__rule" data-rule-type={stayRule.type} aria-label="Visa-free stay rule overview">
                    <p className="evc-map__rule-kicker">Visa-free stay rule</p>
                    <p className="evc-map__rule-value">
                      <span>Up to</span> {stayRule.maxStayDays} days
                    </p>
                    <p className="evc-map__rule-period">
                      {"windowDays" in stayRule ? `in any ${stayRule.windowDays}-day period` : "per visit"}
                    </p>
                    <div className="evc-map__rule-meta">
                      <span className="evc-map__rule-type">{ruleTypeLabel(stayRule)}</span>
                      <span>{isSchengen ? "One shared allowance" : "Own country allowance"}</span>
                    </div>
                  </div>
                )}
                <p className="evc-map__description">
                  {isSchengen
                    ? `${europeCoverage.schengen.length} countries, one shared travel area and stay allowance. Time in any member country counts toward the same rolling window.`
                    : isSupported
                      ? `${region.name === "United Kingdom" ? "The United Kingdom" : region.name} is not a Schengen member and uses its own compliance rules. Its stay allowance is tracked independently of Schengen and other countries.`
                      : `${region.name} is not yet supported by the calculator. It is shown for geographic context, not as an available destination.`}
                </p>
                {ruleNote && (
                  <p className="evc-map__rule-note">
                    {ruleNote.text}{" "}
                    <a href={ruleNote.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {ruleNote.sourceLabel}
                    </a>
                  </p>
                )}
              </div>
              {isSupported ? (
                <a href={this.props.calculatorHref ?? "/app"} className="evc-map__cta">
                  Open the calculator <span aria-hidden="true">&rarr;</span>
                </a>
              ) : (
                <p className="evc-map__unavailable-note">Explore a green region to find a supported destination.</p>
              )}
            </div>

            <div className="evc-map__other">
              <h4>Beyond Schengen</h4>
              <p>Supported non-Schengen countries, each with its own compliance rules.</p>
              <div className="evc-map__chips">
                {europeCoverage.supported.map((country) => (
                  <button
                    type="button"
                    key={country.code}
                    onClick={() => this.select(country.code)}
                    disabled={!ready}
                    aria-pressed={this.selectedId === country.code}
                    aria-label={`Select ${country.name}${ruleAccessibilityLabel(country.code)}`}
                  >
                    {country.code === "GB" ? "UK" : country.code === "BA" ? "Bosnia & Herzegovina" : country.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="evc-map__bottom">
          <details className="evc-map__full-list">
            <summary>
              View all countries and stay rules <span aria-hidden="true">+</span>
            </summary>
            <div className="evc-map__list-grid">
              <div>
                <h4>Schengen &middot; {europeCoverage.schengen.length} countries</h4>
                <p className="evc-map__list-rule">
                  Up to {ruleLabel(stayRules.get(europeCoverage.schengenStayRule)!)} &middot; Rolling window &middot;
                  One shared allowance.
                </p>
                <p>{europeCoverage.schengen.map((country) => country.name).join(", ")}.</p>
              </div>
              <div>
                <h4>Also supported &middot; {europeCoverage.supported.length} countries</h4>
                <p>These countries are not Schengen members and use their own compliance rules.</p>
                <dl className="evc-map__country-rules">
                  {europeCoverage.supported.map((country) => {
                    const rule = ruleByRegion.get(country.code)!;
                    return (
                      <div key={country.code}>
                        <dt>{country.name}</dt>
                        <dd>
                          Up to {ruleLabel(rule)} <span>{ruleTypeLabel(rule)}</span>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <h4>Not yet supported</h4>
                <p>{europeCoverage.unsupported.map((country) => country.name).join(", ")}.</p>
              </div>
            </div>
          </details>
          <p className="evc-map__rule-disclaimer">{europeCoverage.stayRuleDisclaimer}</p>
          <div className="evc-map__fine-print">
            <p>
              This map shows app support, not visa eligibility. Small states may be shown as dots; overseas
              territories are not shown. Cyprus is grouped visually; entry rules can differ across the island.
            </p>
            <p>Map: Natural Earth. Boundaries are illustrative.</p>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * # Third-party notices
 *
 * ## Geographic data
 * Made with Natural Earth. The bundled regional geometry and derived SVG
 * paths (src/data/europe-map.ts) are based on Natural Earth 1:110m
 * geographic data. Country support assignments and the merged coverage
 * presentation (src/data/europe-coverage.ts) are separate application data.
 *
 * Natural Earth's vector and raster datasets are public domain, provided
 * without a guarantee of accuracy or suitability for a particular use.
 * See https://www.naturalearthdata.com/about/terms-of-use/
 */
