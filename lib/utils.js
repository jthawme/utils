import { v4 as uuidv4 } from "uuid";

/**
 * A performant version of a function call, used to keep functions
 * running at 60fps
 *
 * @param {function} cb
 * @returns {function}
 */
export const tickUpdate = (cb) => {
  let ticking = false;

  const update = (e) => {
    cb(e);
    ticking = false;
  };

  const requestTick = (e) => {
    if (!ticking) {
      requestAnimationFrame(() => update(e));
      ticking = true;
    }
  };

  return requestTick;
};

/**
 * Clamps a number
 *
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Maps a number from 1 range to another. I cannot believe
 * how much I've used this function in my lifetime
 *
 * @param {number} value
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

/**
 * A simple linear interpolation function
 *
 * @param {number} v0 Lower value
 * @param {number} v1 Target Value
 * @param {*} t
 * @returns
 */
export const lerp = (v0, v1, t) => {
  return v0 * (1 - t) + v1 * t;
};

/**
 * A promise version of setTimeout
 *
 * @param {number} time
 * @param {boolean} error
 * @returns {Promise<void>}
 */
export const timer = (time = 2000, error = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    }, time);
  });
};

/**
 * Serialised object of form elements
 *
 * @param {HTMLFormElement} form
 * @returns {object}
 */
export const formToObject = (form) => {
  const fd = new FormData(form);

  return Object.fromEntries(fd.entries());
};

/**
 * Convenience function that registers the 2 window events needed
 * to listen for window resizes
 *
 * @param {function} cb
 * @returns {function} Unlisten
 */
export const onWindowResize = (cb) => {
  window.addEventListener("resize", cb, {
    passive: true,
  });

  window.addEventListener("orientationchange", cb, {
    passive: true,
  });

  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
};

/**
 * Registers a 'bootleg' vh unit, to be used in css like
 * var(--vh), based off of actual dimensions not necessarily what
 * the real css value gives
 *
 * Should be superceded by lvh / dvh / svh
 *
 * @returns {function} Unlisten
 */
export const registerBootlegVH = () => {
  // Cached value of window outer height
  let wh = 0;

  const setVh = () => {
    const nh = window.outerHeight;

    // If window outer height doesnt match the browser window really has changed
    // not just the nav bar disappearing
    if (wh !== nh) {
      wh = nh;

      // Set a 'global' property of 1vh to use in your css like
      // calc(var(--vh) * WHATEVER_NUM)
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight / 100}px`
      );
    }
  };

  const cb = tickUpdate(() => {
    setVh();
  });

  setVh();

  return onWindowResize(cb);
};

/**
 * Returns a debounced version of the function, so that it runs
 * only after X seconds of not being called
 *
 * @param {function} cb
 * @param {number} time
 * @returns {function}
 */
export const debounce = (cb, time = 1000) => {
  let timer = 0;

  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb(...arguments);
    }, time);
  };
};

/**
 * Returns a throttled version of the function, so that it runs only
 * a maximum of X seconds
 *
 * @param {function} cb
 * @param {number} time
 * @returns {function}
 */
export const throttle = (cb, time = 1000) => {
  let timer;

  return function () {
    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      cb(...arguments);
      timer = undefined;
    }, time);
  };
};

/**
 * A promise to load an image element
 *
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImageElement = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = src;
  });
};

/**
 * A promise to load an image as a blob url
 *
 * @param {string} src
 * @param {function} onSignal A callback to get an abort signal
 * @returns {Promise<string>}
 */
export const loadImage = (src, onSignal = () => false) => {
  const controller = new AbortController();
  const { signal } = controller;

  onSignal(controller);

  return fetch(src, { signal })
    .then((resp) => resp.blob())
    .then((blob) => URL.createObjectURL(blob));
};

/**
 * A function to register a change listener on a media query
 *
 * @param {string} query
 * @param {function} cb
 * @returns {function} Unlisten
 */
export const breakpointListen = (query, cb) => {
  const mq = window.matchMedia(query);
  const onCall = (ev) => {
    cb(ev.matches);
  };
  mq.addListener(onCall);

  cb(mq.matches);

  return () => mq.removeListener(onCall);
};

/**
 * Adds an event listener and returns a cb to unlisten
 *
 * @param {HTMLElement | Window | Document | EventTarget} el
 * @param {string} evt
 * @param {EventListenerOrEventListenerObject} cb
 * @param {object | false} opts
 * @returns {() => any} Unlisten
 */
export const listenCb = (el, evt, cb, opts = false) => {
  el.addEventListener(evt, cb, opts);
  return () => el.removeEventListener(evt, cb);
};

/**
 * Get random number between 2 numbers
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 *
 * @param {T[]} arr
 * @returns {T}
 * @template T
 */
export const randomFrom = (arr) => {
  return arr[Math.floor(arr.length * Math.random())];
};

/**
 * Randomises array
 *
 * @param {array} array
 * @returns {array}
 */
export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

/**
 * Utility to help detect low power mode
 *
 * @returns {Promise<Boolean>}
 */
export const isLowPower = () => {
  /**
   * Sets up a promise for making sure the video loads before testing.
   * Uses the suspend event which apparently fires regardless for when
   * the video has finished downloading. Then sets a can play event listener
   * to be double sure but also sets a timer, if the timer resolves (which
   * on environments in which low power mode is off, should never happen) it
   * can assume the video can't be played
   *
   * @param {HTMLVideoElement} el
   * @returns
   */
  const loadVideo = (el) => {
    return new Promise((resolve, reject) => {
      let timer = 0;

      const onCanPlay = () => {
        clearTimeout(timer);

        //loadedmetadata not canplay for ios boohoo
        el.removeEventListener("loadedmetadata", onCanPlay);
        resolve(el);
      };

      const onSuspend = () => {
        el.removeEventListener("suspend", onSuspend);

        timer = setTimeout(() => {
          reject("too long");
        }, 500);
      };

      el.addEventListener("suspend", onSuspend);
      el.addEventListener("loadedmetadata", onCanPlay);
      el.load();
    });
  };

  return new Promise((resolve, reject) => {
    let videoEl = document.querySelector(`#lowpower`);

    // Create a video element if the test one can't be found already mounted
    if (!videoEl) {
      // console.log("no video test creating");
      videoEl = document.createElement("video");
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.muted = true;
      videoEl.id = `lowpower`;
      // Very specifically dont add autoplay
      // videoEl.autoplay = true;

      const source = document.createElement("source");
      source.type = `video/mp4`;
      // 5kb
      source.src = `data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACU1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2MyByMzA2MCA1ZGI2YWE2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTIgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAACDmWIhAB//vSj+BTSaXUBsxCW6PzALg74FA/dgccVg8EGt2Axk/JyOG7stC2aelhG3YCVoMYV2/RArmL7h0CSik6m2NszuBRPfgJVVEdSBW9gY0RFBzNtpfAni35C88ncWv2vVr3OgW5fxUvf1kHhSL8kOfc4pR8/DB7NsbDd1WSarzAKL2PFpHv0I8wFitjhss2xi0KGby5UFyRLoTo4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`;

      videoEl.appendChild(source);

      document.body.appendChild(videoEl);
    }

    // Needs to be displayed, some browsers will not play
    // if display is none
    videoEl.style.position = "fixed";
    videoEl.style.width = `100px`;
    videoEl.style.zIndex = 100;
    // videoEl.style.visibility = "hidden";
    // videoEl.style.opacity = 0;

    loadVideo(videoEl)
      .then(() => resolve(videoEl))
      .catch((err) => reject(err));
  })
    .then((el) => {
      // Play the video which should be allowed as its
      // muted and can play inline
      return el
        .play()
        .then(() => false)
        .catch((e) => {
          console.error(e);
          return true;
        });
    })
    .catch(() => {
      return true;
    });
};

const LOCAL_STORAGE_PREFIX = "jt";

/**
 * Convenience feature for grabbing a value from the local storage
 * with a default fallback if not present
 *
 * @param {string} key
 * @param {any} [defaultValue]
 * @param {function} [transform]
 * @returns {string|any}
 */
export const getPersistedValue = (
  key,
  defaultValue,
  transform = (val) => val
) => {
  const item = localStorage.getItem([LOCAL_STORAGE_PREFIX, key].join("-"));

  return item ? transform(item) : defaultValue;
};

/**
 * Saves a value to local storage
 *
 * @param {string} key
 * @param {string} value
 */
export const persistValue = (key, value) => {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem([LOCAL_STORAGE_PREFIX, key].join("-"), value);
};

/**
 * Convenience function to remove item with global prefix
 *
 * @param {string} key
 */
export const removePersistedValue = (key) => {
  localStorage.removeItem([LOCAL_STORAGE_PREFIX, key].join("-"));
};

/**
 * A promisified version of a requestAnimationFrame as a utility
 *
 * @returns {Promise<void>}
 */
export const singleRaf = () => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
};

/**
 * A double version of the requestAnimationFrame promise
 *
 * @returns {Promise<void>}
 */
export const doubleRaf = async () => {
  await singleRaf();
  return singleRaf();
};

const KEYS = {
  ESCAPE: 27,
};

/**
 * A function that registers a key listener for escaping
 *
 * @param {function} onEscape
 * @returns {function} Unlisten
 */
export const registerExits = (onEscape) => {
  const cb = (e) => {
    if ([KEYS.ESCAPE].includes(e.keyCode)) {
      onEscape();
    }
  };

  return listenCb(document, "keyup", cb);
};

/**
 * A function for adding a listener to determine if an interaction was made outside
 * an element of its descendents
 *
 * @param {HTMLElement} el
 * @param {function} onClickOutside
 * @param {function} [validator]
 * @returns {function} Unlisten
 */
export const clickOutside = (
  el,
  onClickOutside,
  validator // (el: HTMLElement, e: MouseEvent) => boolean
) => {
  const cb = (e) => {
    if (validator) {
      if (validator(el, e)) {
        onClickOutside();
      }
    } else if (e.target && e.target !== el && !el.contains(e.target)) {
      onClickOutside();
    }
  };

  const unlisten = listenCb(document, "click", cb);
  const unregisterExits = registerExits(onClickOutside);

  return () => {
    unregisterExits();
    unlisten();
  };
};

export const holdPress = (cb, { debounce = 150, rate = 50 } = {}) => {
  let active = false;

  cb();

  const update = () => {
    cb();

    if (active) {
      setTimeout(update, rate);
    }
  };

  active = true;
  setTimeout(() => {
    if (active) {
      update();
    }
  }, debounce);

  return {
    destroy: () => {
      active = false;
    },
    get active() {
      return active;
    },
  };
};

/**
 *
 * @param {MouseEvent | TouchEvent} evt
 * @param {(long: boolean) => void} onPress
 * @param {(long: boolean) => void} onRelease
 */
export const longPress = (evt, onPress, onRelease) => {
  let longPressed = false;
  let timer = setTimeout(() => {
    longPressed = true;
    onPress(true);
  }, 300);

  /**
   * @param {Event} e
   */
  function cancel(e) {
    if (!longPressed) {
      clearTimeout(timer);
    }
    e.preventDefault();

    unlisten.forEach((cb) => cb());
    onRelease(longPressed);
  }

  evt.preventDefault();

  const unlisten = [
    evt.currentTarget && listenCb(evt.currentTarget, "touchend", cancel),
    evt.currentTarget && listenCb(evt.currentTarget, "touchcancel", cancel),
    evt.currentTarget && listenCb(evt.currentTarget, "mouseup", cancel),
  ].filter((u) => !!u);
};

/**
 *
 * @param {any[]} arr
 * @param {(a: any, b: any) => number} cb
 * @returns
 */
export const toSorted = (arr, cb) => {
  if (typeof arr.toSorted === "function") {
    return arr.toSorted(cb);
  }

  const items = arr.slice();
  items.sort(cb);

  return items;
};

export const getId = () => {
  return uuidv4();
};
