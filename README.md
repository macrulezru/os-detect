# os-detect

Simple OS and device type detection for browsers (no dependencies).

## Installation

```
npm install os-detect
```

## Usage

```js
const osDetect = require('os-detect');

console.log(osDetect.detectIsiOS()); // true/false
console.log(osDetect.detectIsMacOS()); // true/false
console.log(osDetect.detectIsAndroid()); // true/false
console.log(osDetect.detectIsWindows()); // true/false
console.log(osDetect.detectIsLinux()); // true/false
console.log(osDetect.isMobileDevice()); // true/false
console.log(osDetect.isDesktopDevice()); // true/false
```

## API

- `detectIsiOS()`
- `detectIsMacOS()`
- `detectIsAndroid()`
- `detectIsWindows()`
- `detectIsLinux()`
- `isMobileDevice()`
- `isDesktopDevice()`

All functions return a boolean.

## Author

Danil Lisin Vladimirovich aka Macrulez

GitHub: [macrulezru](https://github.com/macrulezru)

Website: [macrulez.ru](https://macrulez.ru/)

## License

MIT
