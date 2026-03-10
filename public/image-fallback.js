(function () {
    function isImageElement(node) {
        return node && node.nodeType === 1 && node.tagName === "IMG";
    }

    function getFallbackText(image) {
        var altText = (image.getAttribute("alt") || "").trim();
        return altText || "Image unavailable";
    }

    function ensureWrapper(image) {
        var existingWrapper = image.closest(".image-wrapper");
        if (existingWrapper) {
            return existingWrapper;
        }

        var parent = image.parentElement;
        if (!parent) {
            return null;
        }

        var parentCanBeWrapper = parent.children.length === 1 && !parent.querySelector(".image-wrapper__fallback");
        if (parentCanBeWrapper) {
            parent.classList.add("image-wrapper");
            return parent;
        }

        var wrapper = document.createElement("span");
        var imageDisplay = window.getComputedStyle(image).display;

        wrapper.className = "image-wrapper";
        if (imageDisplay === "inline" || imageDisplay === "inline-block") {
            wrapper.classList.add("image-wrapper--auto-inline");
        }

        parent.insertBefore(wrapper, image);
        wrapper.appendChild(image);
        return wrapper;
    }

    function ensureFallbackNode(wrapper, image) {
        var fallback = wrapper.querySelector(":scope > .image-wrapper__fallback");
        if (!fallback) {
            fallback = document.createElement("span");
            fallback.className = "image-wrapper__fallback";
            fallback.setAttribute("aria-hidden", "true");
            wrapper.appendChild(fallback);
        }

        fallback.textContent = getFallbackText(image);
        return fallback;
    }

    function setPending(wrapper) {
        wrapper.classList.add("image-wrapper--pending");
        wrapper.classList.remove("image-wrapper--ready");
        wrapper.classList.remove("image-wrapper--error");
    }

    function setReady(wrapper) {
        wrapper.classList.remove("image-wrapper--pending");
        wrapper.classList.remove("image-wrapper--error");
        wrapper.classList.add("image-wrapper--ready");
    }

    function setError(wrapper) {
        wrapper.classList.remove("image-wrapper--pending");
        wrapper.classList.remove("image-wrapper--ready");
        wrapper.classList.add("image-wrapper--error");
    }

    function resolveState(image, wrapper) {
        if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
            setReady(wrapper);
            return;
        }

        if (image.complete) {
            setError(wrapper);
            return;
        }

        setPending(wrapper);
    }

    function bindImage(image) {
        if (!isImageElement(image)) {
            return;
        }

        var wrapper = ensureWrapper(image);
        if (!wrapper) {
            return;
        }

        ensureFallbackNode(wrapper, image);

        if (image.dataset.fallbackBound !== "true") {
            image.dataset.fallbackBound = "true";

            image.addEventListener("load", function () {
                setReady(wrapper);
            });

            image.addEventListener("error", function () {
                setError(wrapper);
            });
        }

        resolveState(image, wrapper);
    }

    function processNode(node) {
        if (!node || node.nodeType !== 1) {
            return;
        }

        if (isImageElement(node)) {
            bindImage(node);
        }

        var nestedImages = node.querySelectorAll("img");
        nestedImages.forEach(bindImage);
    }

    function refreshImage(image) {
        if (!isImageElement(image)) {
            return;
        }

        var wrapper = ensureWrapper(image);
        if (!wrapper) {
            return;
        }

        ensureFallbackNode(wrapper, image);
        resolveState(image, wrapper);
    }

    document.querySelectorAll("img").forEach(bindImage);

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(processNode);
                return;
            }

            if (mutation.type === "attributes" && isImageElement(mutation.target)) {
                refreshImage(mutation.target);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src", "srcset", "alt"]
    });
})();
