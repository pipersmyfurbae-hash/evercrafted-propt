# Evercrafted Design Studio — Weather Blueprint Handoff Receiver

The Weather Blueprint Studio sends a base64url JSON payload in the URL fragment:

`#evercrafted=<payload>`

It also writes `evercrafted_current_blueprint` and `evercrafted_composition_handoff` to localStorage for same-origin installs.

The current Everfracted route is `/app/apps/studio`.

Add this inside `DesignStudio()` in `pages/DesignStudio.tsx`, after the state declarations. It converts the Weather Blueprint schema into the Design Studio's `elements` shape without changing the source placement data.

```tsx
useEffect(() => {
  const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  const encoded = params.get('evercrafted');
  let handoff: any = null;

  try {
    if (encoded) handoff = JSON.parse(decodeBase64Url(encoded));
    if (!handoff) {
      const stored = localStorage.getItem('evercrafted_composition_handoff');
      if (stored) handoff = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Evercrafted handoff decode failed', error);
    return;
  }

  if (!handoff?.blueprint?.placements) return;
  const bp = handoff.blueprint;
  const roleMap: Record<string, any> = {
    greenery: 'greenery', focal: 'focal', secondary: 'filler', accent: 'accent', ribbon: 'accent'
  };
  const clockToTheta = (clock: string) => {
    const [h, m = '0'] = String(clock).split(':').map(Number);
    return ((h % 12) * 30 + m * 0.5) % 360;
  };

  const imported = {
    id: bp.id || `WB-${Date.now()}`,
    name: bp.title || 'Weather Blueprint',
    formula: 'Crescent',
    source: handoff.source || 'weather-blueprint-studio',
    weather: handoff.weather,
    originalWeatherBlueprint: bp,
    palette: bp.palette,
    renderPrompt: bp.weatherTranslation,
    elements: bp.placements.map((p: any, index: number) => ({
      id: p.id || `E${index + 1}`,
      name: p.element,
      role: roleMap[p.role] || p.role,
      theta: clockToTheta(p.clock),
      radius: Number(p.radius),
      layer: p.role === 'greenery' ? 'foundation' : p.role === 'focal' ? 'focal' : p.role === 'ribbon' ? 'decorative' : 'support',
      clock_position: p.clock,
      construction_note: p.constructionNote,
      locked: false,
    })),
  };

  setBlueprints(prev => [imported, ...prev.filter(x => x.id !== imported.id)]);
  setSelectedBlueprintId(imported.id);
  setLocalBlueprint(imported);
  setHasUnsavedChanges(true);
  toast.success(`Imported ${bp.title} from Weather Blueprint Studio`);

  history.replaceState(null, '', window.location.pathname + window.location.search);
}, []);
```

This preserves the original Weather Blueprint under `originalWeatherBlueprint` so round-tripping remains possible.
