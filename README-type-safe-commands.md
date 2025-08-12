# Type-safe Commands in Base

Diese Implementierung bietet jetzt type-safe Commands mit vollständiger TypeScript-Unterstützung.

## Neue Features

### 1. Type-safe Command Handlers

Command-Handler können jetzt mit spezifischen Parameter-Typen definiert werden:

```typescript
import { Base, defineBaseConfig, type CommandsRecord } from './src/index';

// Definiere Commands mit spezifischen Typen
const myCommands = {
  // Command mit typed options object
  build: (options: { watch?: boolean; target?: string }) => {
    console.log('Building with options:', options);
  },
  
  // Command mit mehreren spezifischen Parametern
  deploy: (environment: string, force: boolean = false) => {
    console.log(`Deploying to ${environment}, force: ${force}`);
  },
  
  // Command ohne Parameter
  clean: () => {
    console.log('Cleaning...');
  },
  
  // Command als Object mit Handler und Metadaten
  test: {
    description: 'Run tests',
    handler: (pattern?: string) => {
      console.log(`Running tests with pattern: ${pattern || 'all'}`);
    }
  }
} satisfies CommandsRecord;
```

### 2. Type-safe Config Definition

```typescript
const config = defineBaseConfig({
  commands: myCommands,
  global: false,
  // ... andere config options
});

const base = new Base(config);
```

### 3. Type-safe run() Method

Der `run` method ist jetzt vollständig type-safe:

```typescript
// ✅ Korrekte Aufrufe - TypeScript validiert Parameter
base.run('build', { watch: true, target: 'production' });
base.run('deploy', 'staging', true);
base.run('clean');
base.run('test', 'unit');

// ❌ Diese würden TypeScript-Fehler verursachen:
// base.run('build', 'wrong-type');        // Falscher Parametertyp
// base.run('deploy');                     // Fehlender erforderlicher Parameter
// base.run('nonexistent');                // Command existiert nicht
// base.run('clean', 'extra-param');       // Zu viele Parameter
```

## Type-System Erklärung

### Neue Types

- `CommandHandler<TParams>`: Typisierte Handler-Funktion
- `CommandObject<TParams>`: Command-Object mit typisiertem Handler
- `CommandDefinition<TParams>`: Union von Handler oder Object
- `CommandsRecord`: Record von Command-Definitionen
- `CommandNames<T>`: Extrahiert Command-Namen aus Commands-Record
- `CommandParams<T, K>`: Extrahiert Parameter-Typen für spezifischen Command

### Generische Base-Klasse

```typescript
class Base<TCommands extends CommandsRecord = {}> {
  config: Config<TCommands>;
  
  run<K extends CommandNames<TCommands>>(
    name: K,
    ...args: CommandParams<TCommands, K>
  ): unknown;
}
```

### Config-Type

```typescript
type Config<TCommands extends CommandsRecord = CommandsRecord> = {
  commands: TCommands;
  // ... andere properties
};
```

## Backward Compatibility

Die Änderungen sind vollständig rückwärtskompatibel:

- Bestehender Code funktioniert weiterhin
- Default-Fall (leere Commands) wird korrekt behandelt
- Alle bestehenden Method-Signaturen bleiben unverändert

## Vorteile

1. **Compile-Time Type Checking**: Parameter werden zur Build-Zeit validiert
2. **IntelliSense Support**: Bessere IDE-Unterstützung mit Autocompletion
3. **Refactoring Safety**: Änderungen an Command-Signaturen werden automatisch erfasst
4. **Documentation**: Types dienen als Dokumentation für Command-APIs
5. **Error Prevention**: Verhindert Laufzeit-Fehler durch falsche Parameter

## Migration

Für bestehende Projekte:

1. Commands können schrittweise mit spezifischen Typen versehen werden
2. `satisfies CommandsRecord` kann verwendet werden, um Type-Safety zu gewährleisten
3. Der `defineBaseConfig` Helper bietet zusätzliche Type-Safety für die Konfiguration
