import { useState } from "react";
import { Shuffle, Save } from "lucide-react";

import {
  STYLE_OPTIONS,
  HAIR_OPTIONS,
  EYES_OPTIONS,
  EYEBROWS_OPTIONS,
  GLASSES_OPTIONS,
  EARRINGS_OPTIONS,
  SKIN_COLORS,
  HAIR_COLORS,
  BACKGROUND_COLORS,
  getDefaultAvatarConfig,
  buildAvatarUrl,
} from "./dicebearOptions";

const ADJECTIVES = ["Swift", "Bright", "Clever", "Bold", "Sunny", "Mighty", "Quick", "Calm"];
const ANIMALS = ["Falcon", "Otter", "Tiger", "Panda", "Fox", "Wolf", "Hawk", "Dolphin"];

function randomSeed() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${a}${b}${Math.floor(Math.random() * 1000)}`;
}

function OptionGrid({ options, value, onChange, renderSwatch }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt ?? "none"}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-2xl border-2 p-1.5 transition hover:scale-105 ${
            value === opt ? "border-[#008388] bg-[#008388]/5" : "border-transparent hover:border-slate-200"
          }`}
        >
          {renderSwatch(opt)}
        </button>
      ))}
    </div>
  );
}

function ColorSwatch({ hex, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-9 h-9 rounded-full border-2 transition ${
        selected ? "border-[#008388] scale-110" : "border-white shadow"
      }`}
      style={{ backgroundColor: `#${hex}` }}
      aria-label={`Color ${hex}`}
    />
  );
}

export default function AvatarBuilder({ initialConfig, onSave, saving = false }) {
  const [config, setConfig] = useState(initialConfig || getDefaultAvatarConfig());

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const previewUrl = buildAvatarUrl(config);
  const isAdventurer = config.style === "adventurer";

  const handleShuffle = () => {
    setConfig((prev) => ({
      ...prev,
      seed: randomSeed(),
      hair: HAIR_OPTIONS[Math.floor(Math.random() * HAIR_OPTIONS.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      eyes: EYES_OPTIONS[Math.floor(Math.random() * EYES_OPTIONS.length)],
      eyebrows: EYEBROWS_OPTIONS[Math.floor(Math.random() * EYEBROWS_OPTIONS.length)],
      glasses: Math.random() > 0.6 ? GLASSES_OPTIONS[Math.floor(Math.random() * GLASSES_OPTIONS.length)] : null,
      earrings: Math.random() > 0.6 ? EARRINGS_OPTIONS[Math.floor(Math.random() * EARRINGS_OPTIONS.length)] : null,
      backgroundColor: BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)],
    }));
  };

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      {/* Live preview */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-44 h-44 rounded-[28px] flex items-center justify-center"
          style={{ backgroundColor: `#${config.backgroundColor}` }}
        >
          <img src={previewUrl} alt="Your character" className="w-36 h-36" />
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="flex items-center gap-2 text-sm font-medium text-[#008388] hover:text-cyan-600"
        >
          <Shuffle size={16} />
          Surprise me
        </button>

        <button
          type="button"
          onClick={() => onSave(config)}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-[#008388] to-blue-600 text-white font-medium py-3 shadow-[0_10px_30px_rgba(0,131,136,0.25)] disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save My Character"}
        </button>
      </div>

      {/* Option pickers */}
      <div className="space-y-7">
        {/* Style — the big, unmistakable choice */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Character Style</p>
          <div className="flex flex-wrap gap-3">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update("style", s.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition hover:scale-105 ${
                  config.style === s.id
                    ? "border-[#008388] bg-[#008388]/5"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                <img
                  src={buildAvatarUrl({ ...config, style: s.id })}
                  alt={s.label}
                  className="w-14 h-14"
                />
                <span className="text-xs text-slate-500">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isAdventurer && (
          <>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Hairstyle</p>
              <OptionGrid
                options={HAIR_OPTIONS}
                value={config.hair}
                onChange={(v) => update("hair", v)}
                renderSwatch={(opt) => (
                  <img
                    src={buildAvatarUrl({ ...config, hair: opt })}
                    alt={opt}
                    className="w-14 h-14"
                  />
                )}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Eyes</p>
              <OptionGrid
                options={EYES_OPTIONS}
                value={config.eyes}
                onChange={(v) => update("eyes", v)}
                renderSwatch={(opt) => (
                  // glasses removed here on purpose — they cover the eyes,
                  // which made every swatch look identical
                  <img
                    src={buildAvatarUrl({ ...config, eyes: opt }, { glasses: null })}
                    alt={opt}
                    className="w-14 h-14"
                  />
                )}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Eyebrows</p>
              <OptionGrid
                options={EYEBROWS_OPTIONS}
                value={config.eyebrows}
                onChange={(v) => update("eyebrows", v)}
                renderSwatch={(opt) => (
                  <img
                    src={buildAvatarUrl({ ...config, eyebrows: opt }, { glasses: null })}
                    alt={opt}
                    className="w-14 h-14"
                  />
                )}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Glasses</p>
              <OptionGrid
                options={[null, ...GLASSES_OPTIONS]}
                value={config.glasses}
                onChange={(v) => update("glasses", v)}
                renderSwatch={(opt) =>
                  opt === null ? (
                    <div className="w-14 h-14 flex items-center justify-center text-xs text-slate-400 border border-dashed rounded-xl">
                      None
                    </div>
                  ) : (
                    <img
                      src={buildAvatarUrl({ ...config, glasses: opt })}
                      alt={opt}
                      className="w-14 h-14"
                    />
                  )
                }
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Earrings</p>
              <OptionGrid
                options={[null, ...EARRINGS_OPTIONS]}
                value={config.earrings}
                onChange={(v) => update("earrings", v)}
                renderSwatch={(opt) =>
                  opt === null ? (
                    <div className="w-14 h-14 flex items-center justify-center text-xs text-slate-400 border border-dashed rounded-xl">
                      None
                    </div>
                  ) : (
                    <img
                      src={buildAvatarUrl({ ...config, earrings: opt })}
                      alt={opt}
                      className="w-14 h-14"
                    />
                  )
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Skin tone</p>
                <div className="flex flex-wrap gap-2">
                  {SKIN_COLORS.map((hex) => (
                    <ColorSwatch
                      key={hex}
                      hex={hex}
                      selected={config.skinColor === hex}
                      onClick={() => update("skinColor", hex)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Hair color</p>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((hex) => (
                    <ColorSwatch
                      key={hex}
                      hex={hex}
                      selected={config.hairColor === hex}
                      onClick={() => update("hairColor", hex)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Background</p>
          <div className="flex flex-wrap gap-2">
            {BACKGROUND_COLORS.map((hex) => (
              <ColorSwatch
                key={hex}
                hex={hex}
                selected={config.backgroundColor === hex}
                onClick={() => update("backgroundColor", hex)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
