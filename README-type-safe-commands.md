# Type-safe Commands with Extensible Config

Diese Implementierung bietet jetzt type-safe Commands mit vollständiger TypeScript-Unterstützung und erweiterbarer Config.

## Neue Features

### 1. Type-safe Command Handlers

Command-Handler können jetzt mit spezifischen Parameter-Typen definiert werden:

```typescript
import { Base, defineBaseConfig, type BaseConfig } from './src/index';

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
  }
};
```

### 2. Extensible Config System

Das neue System verwendet `TConfig extends BaseConfig` anstatt zusätzlicher Config-Parameter:

```typescript
// Erweitere BaseConfig mit eigenen Feldern
interface MyExtendedConfig extends BaseConfig {
  apiUrl: string;
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
  };
}

// Commands mit Zugriff auf erweiterte Config
const commands = {
  deploy: function(this: Base<MyExtendedConfig>, target?: string) {
    // ✅ Vollständiger Zugriff auf alle Config-Felder
    console.log(`Deploying to ${target || this.config.environment}`);
    console.log(`API URL: ${this.config.apiUrl}`);
    console.log(`Database: ${this.config.database.host}:${this.config.database.port}`);
  },
  
  apiCall: function(this: Base<MyExtendedConfig>, endpoint: string) {
    const fullUrl = `${this.config.apiUrl}${endpoint}`;
    console.log(`Making request to: ${fullUrl}`);
  }
};
```

### 3. Type-safe Config Creation

```typescript
// Erstelle vollständige Config mit allen erforderlichen Feldern
const config: MyExtendedConfig = {
  // Base config fields
  global: false,
  commands: commands,
  // ... alle anderen BaseConfig-Felder
  
  // Extended config fields
  apiUrl: 'https://api.example.com',
  apiKey: 'secret-key',
  environment: 'development',
  features: {
    enableCache: true,
    enableMetrics: false
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp_dev'
  }
};

const base = new Base<MyExtendedConfig>(config);
```

### 4. Type-safe run() Method

Der `run` method ist jetzt vollständig type-safe:

```typescript
// ✅ Korrekte Aufrufe - TypeScript validiert Parameter
base.run('deploy', 'staging');
base.run('apiCall', '/users');

// ❌ Diese würden TypeScript-Fehler verursachen:
// base.run('deploy', 123);        // Falscher Parametertyp
// base.run('nonexistent');        // Command existiert nicht
```

## Type-System Erklärung

### Erweiterte Types

- `BaseConfig`: Basis-Interface das erweitert werden kann
- `CommandHandler<TParams, TConfig>`: Typisierte Handler-Funktion mit Config-Zugriff
- `CommandObject<TParams, TConfig>`: Command-Object mit typisiertem Handler
- `CommandDefinition<TParams, TConfig>`: Union von Handler oder Object
- `CommandsRecord<TConfig>`: Record von Command-Definitionen für spezifische Config
- `CommandNames<T>`: Extrahiert Command-Namen aus Commands-Record
- `CommandParams<T, K>`: Extrahiert Parameter-Typen für spezifischen Command

### Generische Base-Klasse

```typescript
class Base<TConfig extends BaseConfig = BaseConfig> {
  config: TConfig;
  
  run<K extends CommandNames<CommandsRecord<TConfig>>>(
    name: K,
    ...args: CommandParams<CommandsRecord<TConfig>, K>
  ): unknown;
}
```

### Erweiterbares Config-System

```typescript
interface BaseConfig {
  // Standard Base-Properties
  global: boolean;
  commands: Record<string, any>;
  // ... alle anderen Standard-Felder
}

// Erweitere mit eigenen Feldern
interface MyConfig extends BaseConfig {
  customField: string;
  mySettings: { [key: string]: any };
}
```

## Backward Compatibility

Die Änderungen sind vollständig rückwärtskompatibel:

- Bestehender Code funktioniert weiterhin
- Default-Fall (BaseConfig) wird korrekt behandelt
- Alle bestehenden Method-Signaturen bleiben unverändert
- Schrittweise Migration möglich

## Vorteile

1. **Compile-Time Type Checking**: Parameter werden zur Build-Zeit validiert
2. **IntelliSense Support**: Bessere IDE-Unterstützung mit Autocompletion
3. **Refactoring Safety**: Änderungen an Command-Signaturen werden automatisch erfasst
4. **Documentation**: Types dienen als Dokumentation für Command-APIs
5. **Error Prevention**: Verhindert Laufzeit-Fehler durch falsche Parameter
6. **Extended Config Access**: Commands haben typesicheren Zugriff auf erweiterte Config-Felder
7. **Full Type Safety**: Sowohl Commands als auch Config-Erweiterungen sind vollständig typisiert
8. **Flexible Extension**: Configs können beliebig erweitert werden durch Interface-Extension

## Migration

Für bestehende Projekte:

1. Commands können schrittweise mit spezifischen Typen versehen werden
2. Config kann durch Interface-Extension erweitert werden
3. Commands können schrittweise auf erweiterte Config-Felder zugreifen
4. Der `defineBaseConfig` Helper bietet zusätzliche Type-Safety
5. Vollständige Typisierung kann schrittweise implementiert werden

## Beispiel: Vollständige Implementierung

```typescript
// 1. Erweitere BaseConfig
interface AppConfig extends BaseConfig {
  apiUrl: string;
  environment: 'dev' | 'prod';
}

// 2. Definiere Commands mit Config-Zugriff
const commands = {
  deploy: function(this: Base<AppConfig>) {
    console.log(`Deploying to ${this.config.environment}`);
    console.log(`API: ${this.config.apiUrl}`);
  }
};

// 3. Erstelle typisierte Config
const config: AppConfig = {
  // ... alle BaseConfig-Felder
  commands,
  apiUrl: 'https://api.app.com',
  environment: 'dev'
};

// 4. Verwende mit vollständiger Type-Safety
const base = new Base<AppConfig>(config);
base.run('deploy'); // ✅ Vollständig typisiert
```
