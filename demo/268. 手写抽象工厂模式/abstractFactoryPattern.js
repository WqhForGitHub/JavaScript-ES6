/**
 * 抽象工厂模式 (Abstract Factory Pattern)
 *
 * Approach:
 * - Provide an interface for creating FAMILIES of related or dependent objects
 *   without specifying their concrete classes.
 * - We model a cross-platform UI toolkit: each "theme" factory produces a coordinated
 *   family: Button + Input + Dialog. A "dark" theme and a "light" theme render
 *   matching components; mixing them would be visually inconsistent, so the factory
 *   guarantees they belong together.
 * - AbstractFactory defines the contract (createButton/createInput/createDialog);
 *   concrete factories implement it. The client code depends only on the abstract
 *   interface, so swapping themes = swapping the factory passed in.
 */

// ---- Abstract products (interfaces expressed as base classes) ----
class Button {
  render() {
    throw new Error("abstract");
  }
}
class Input {
  render() {
    throw new Error("abstract");
  }
}
class Dialog {
  render() {
    throw new Error("abstract");
  }
}

// ---- Dark theme concrete products ----
class DarkButton extends Button {
  render() {
    return '<button class="dark-btn">Click</button>';
  }
}
class DarkInput extends Input {
  render() {
    return '<input class="dark-input" />';
  }
}
class DarkDialog extends Dialog {
  render() {
    return '<div class="dark-dialog">Modal</div>';
  }
}

// ---- Light theme concrete products ----
class LightButton extends Button {
  render() {
    return '<button class="light-btn">Click</button>';
  }
}
class LightInput extends Input {
  render() {
    return '<input class="light-input" />';
  }
}
class LightDialog extends Dialog {
  render() {
    return '<div class="light-dialog">Modal</div>';
  }
}

// ---- Abstract factory ----
class UIFactory {
  createButton() {
    throw new Error("abstract");
  }
  createInput() {
    throw new Error("abstract");
  }
  createDialog() {
    throw new Error("abstract");
  }
}

// ---- Concrete factories ----
class DarkUIFactory extends UIFactory {
  createButton() {
    return new DarkButton();
  }
  createInput() {
    return new DarkInput();
  }
  createDialog() {
    return new DarkDialog();
  }
}

class LightUIFactory extends UIFactory {
  createButton() {
    return new LightButton();
  }
  createInput() {
    return new LightInput();
  }
  createDialog() {
    return new LightDialog();
  }
}

// ---- Client code: depends only on the abstract factory interface ----
function renderForm(factory) {
  const button = factory.createButton();
  const input = factory.createInput();
  const dialog = factory.createDialog();
  return [button.render(), input.render(), dialog.render()];
}

// ---------------- Test cases ----------------
console.log(renderForm(new DarkUIFactory()));
// Expected: [ '<button class="dark-btn">Click</button>',
//             '<input class="dark-input" />',
//             '<div class="dark-dialog">Modal</div>' ]

console.log(renderForm(new LightUIFactory()));
// Expected: [ '<button class="light-btn">Click</button>',
//             '<input class="light-input" />',
//             '<div class="light-dialog">Modal</div>' ]

// Each factory's products share the same theme (family consistency)
const darkFactory = new DarkUIFactory();
const b = darkFactory.createButton();
console.log(b instanceof Button, b.render().includes("dark"));
// Expected: true true

// Abstract base methods throw if not overridden
try {
  new UIFactory().createButton();
} catch (e) {
  console.log("Abstract error:", e.message);
  // Expected: Abstract error: abstract
}
