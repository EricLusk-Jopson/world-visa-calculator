import React from "react";
import { europeCoverage } from "@/data/europe-coverage";
import type { StayRule } from "@/data/europe-coverage";
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
const schengenCodes = new Set(
  europeCoverage.schengen.map((country) => country.code),
);
const supportedCount =
  europeCoverage.schengen.length + europeCoverage.supported.length;

// Rules are presentation data only. Sharing a rule definition never pools
// allowances across countries; only Schengen is one compliance region.
const stayRules = new Map(Object.entries(europeCoverage.stayRules));
const ruleByRegion = new Map<string, StayRule | undefined>([
  ["schengen", stayRules.get(europeCoverage.schengenStayRule)],
  ...europeCoverage.supported.map((country): [string, StayRule | undefined] => [
    country.code,
    stayRules.get(country.stayRule),
  ]),
]);
const ruleTypeLabel = (rule: StayRule) => {
  switch (rule.type) {
    case "rolling-window":
      return "Rolling window";
    case "per-visit":
      return "Per visit";
    case "schengen-de-facto":
      return "De facto Schengen member";
  }
};
/** Plain-text rule summary — used for the accessible label and as a fallback. */
const ruleLabel = (rule: StayRule): string => {
  switch (rule.type) {
    case "rolling-window":
      return `${rule.maxStayDays} days in any ${rule.windowDays} days`;
    case "per-visit":
      return `${rule.maxStayDays} days per visit`;
    case "schengen-de-facto":
      return "Same Schengen limit, de facto";
  }
};
/** Visual rule display — italicizes "de facto" for the de-facto-member rule. */
const ruleDisplay = (rule: StayRule): React.ReactNode =>
  rule.type === "schengen-de-facto"
    ? <>Same Schengen limit, <em>de facto</em></>
    : ruleLabel(rule);
const ruleAccessibilityLabel = (regionId: string) => {
  const rule = ruleByRegion.get(regionId);
  if (!rule) return "";
  return rule.type === "schengen-de-facto"
    ? ", visa-free rule overview: same Schengen limit, de facto"
    : `, visa-free rule overview: up to ${ruleLabel(rule)}, ${ruleTypeLabel(rule).toLowerCase()}`;
};
interface ViewState {
  zoom: number;
  x: number;
  y: number;
}

const initialView: ViewState = { zoom: 1, x: 0, y: 0 };
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const regionIdFor = (code: string) =>
  schengenCodes.has(code) ? "schengen" : code;
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

export class EuropeCoverageIsland extends React.Component<
  EuropeCoverageIslandProps,
  EuropeCoverageIslandState
> {
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
    this.setState({
      selectedCountry: countryCode,
      hoveredId: null,
      focusedId: null,
    });
  };

  private pointFromEvent = (event: PointerEvent): [number, number] | null => {
    const matrix = this.svg?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return [point.x, point.y];
  };

  private onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || this.state.view.zoom <= 1)
      return;
    const start = this.pointFromEvent(event);
    if (start)
      this.drag = {
        pointerId: event.pointerId,
        start,
        view: this.state.view,
        moved: false,
      };
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
      view: boundedView({
        ...drag.view,
        x: drag.view.x + dx,
        y: drag.view.y + dy,
      }),
    });
  };

  private finishDrag = (event: PointerEvent, cancelled: boolean) => {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const moved = this.drag.moved;
    this.drag = null;
    if (this.svg?.hasPointerCapture(event.pointerId))
      this.svg.releasePointerCapture(event.pointerId);
    this.suppressClick = moved && !cancelled;
    clearTimeout(this.suppressionTimer);
    // The click immediately following pointerup must not select a country.
    this.suppressionTimer = setTimeout(() => {
      this.suppressClick = false;
    }, 0);
    this.setState({ dragging: false });
  };

  private onPointerUp = (event: PointerEvent) => this.finishDrag(event, false);
  private onPointerCancel = (event: PointerEvent) =>
    this.finishDrag(event, true);

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
        view: boundedView({
          ...view,
          x: view.x + offset[0],
          y: view.y + offset[1],
        }),
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
        region.id === "schengen"
          ? `, ${europeCoverage.schengen.length} countries in one region`
          : ""
      }${ruleAccessibilityLabel(region.id)}`}
      aria-pressed={this.selectedId === region.id}
      aria-controls={`${this.props.id ?? "europe-coverage"}-detail`}
      onMouseEnter={() => {
        if (this.state.ready && !this.state.dragging)
          this.setState({ hoveredId: region.id });
      }}
      onMouseLeave={() => {
        if (this.state.hoveredId === region.id)
          this.setState({ hoveredId: null });
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
        <path
          className="evc-map__shape"
          d={region.path}
          fillRule="evenodd"
          vectorEffect="non-scaling-stroke"
        />
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
    this.svg?.addEventListener("pointermove", this.onPointerMove, {
      passive: false,
    });
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
    const stayRule = ruleByRegion.get(region.id);
    const { view, ready } = this.state;

    return (
      <div className="evc-map" data-ready={ready}>
        <div className="evc-map__topbar">
          <div className="evc-map__legend" aria-label="Map legend">
            <span>
              <i
                className="evc-map__swatch evc-map__swatch--schengen"
                aria-hidden="true"
              />
              Schengen
            </span>
            <span>
              <i
                className="evc-map__swatch evc-map__swatch--supported"
                aria-hidden="true"
              />
              Supported
            </span>
            <span>
              <i
                className="evc-map__swatch evc-map__swatch--unsupported"
                aria-hidden="true"
              />
              Not yet supported
            </span>
          </div>
          <span className="evc-map__total">
            {supportedCount} countries covered
          </span>
        </div>

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
              Schengen is a single selectable region. Supported non-Schengen
              countries use their own compliance rules. Grey, hatched regions
              are not yet supported. Hover or focus a region to see its name and
              stay rule; click or press Enter to keep it selected.
            </desc>
            <defs>
              <pattern
                id={`${id}-hatch`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <rect width="8" height="8" fill="#e1e6e9" />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke="#cbd3d9"
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>
            <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
              <path
                d={europeMap.contextPath}
                className="evc-map__context"
                fillRule="evenodd"
                aria-hidden="true"
              />
              {regions
                .filter((item) => item.status !== "unsupported")
                .map(this.renderRegion)}
              <g style={{ fill: `url(#${id}-hatch)` }}>
                {regions
                  .filter((item) => item.status === "unsupported")
                  .map(this.renderRegion)}
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

          <div
            id={`${id}-detail`}
            className="evc-map__info"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="evc-map__info-name">{region.name}</p>
            <p className="evc-map__info-rule">
              {stayRule ? ruleDisplay(stayRule) : "Not yet supported"}
            </p>
          </div>

          <div
            className="evc-map__zoom"
            role="group"
            aria-label="Map zoom controls"
          >
            <button
              type="button"
              onClick={() => this.zoom(1.5)}
              disabled={!ready || view.zoom >= 4}
              aria-label="Zoom in"
            >
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
            {ready
              ? "Hover to explore. Click or tap to select."
              : "Interactive controls load when the map is visible."}
          </p>
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
