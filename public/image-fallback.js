(function () {
    var wrappers = document.querySelectorAll(".image-wrapper");

    wrappers.forEach(function (wrapper) {
        var image = wrapper.querySelector("img");
        var fallback = wrapper.querySelector(".image-wrapper__fallback");

        if (!image || !fallback) {
            return;
        }

        var altText = (image.getAttribute("alt") || "Image unavailable").trim() || "Image unavailable";
        fallback.textContent = altText;

        function showFallback() {
            wrapper.classList.add("image-wrapper--error");
            wrapper.classList.remove("image-wrapper--ready");
        }

        function resolveState() {
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                wrapper.classList.remove("image-wrapper--error");
                wrapper.classList.add("image-wrapper--ready");
                return;
            }

            showFallback();
        }

        image.addEventListener("error", showFallback, { once: true });
        image.addEventListener("load", resolveState, { once: true });

        if (image.complete) {
            resolveState();
        }
    });
})();
