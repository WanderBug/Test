const form = document.getElementById("regForm");
const formError = document.getElementById("formError");
const success = document.getElementById("success");
const provinceField = document.getElementById("provinceField");

const $ = (id) => document.getElementById(id);

const nameRegex = /^[A-Za-zÑñ][A-Za-zÑñ .'-]*$/;

const rules = {
    crn(v) {
        if (!v) return "Enter your CRN or SS number.";
        const digits = v.replace(/-/g, "");
        if (!/^\d+$/.test(digits)) return "Use numbers only.";
        if (digits.length !== 10 && digits.length !== 12)
            return "SS number has 10 digits, CRN has 12 digits.";
        return "";
    },
    email(v) {
        if (!v) return "Enter your email address.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, like juan@example.com.";
        return "";
    },
    confirmEmail(v) {
        if (!v) return "Re-enter your email address.";
        if (v.toLowerCase() !== $("email").value.trim().toLowerCase()) return "Email addresses do not match.";
        return "";
    },
    userId(v) {
        if (!v) return "Enter a preferred User ID.";
        if (/[#%()\\\-'"|&*\/]/.test(v)) return "Remove the special characters. Only letters, numbers and _ are allowed.";
        if (!/^[A-Za-z]/.test(v)) return "The first character must be a letter.";
        if (!/^[A-Za-z0-9_]+$/.test(v)) return "Only letters, numbers and underscores are allowed.";
        if (v.length < 8 || v.length > 20) return "User ID must be 8 to 20 characters.";
        return "";
    },
    confirmUserId(v) {
        if (!v) return "Re-enter your User ID.";
        if (v !== $("userId").value.trim()) return "User IDs do not match.";
        return "";
    },
    surname(v) {
        if (!v) return "Enter your surname.";
        if (!nameRegex.test(v)) return "Use letters, spaces, hyphens, apostrophes or periods only.";
        return "";
    },
    givenName(v) {
        if (!v) return "Enter your given name.";
        if (!nameRegex.test(v)) return "Use letters, spaces, hyphens, apostrophes or periods only.";
        return "";
    },
    middleName(v) {
        if (v && !nameRegex.test(v)) return "Use letters, spaces, hyphens, apostrophes or periods only.";
        return "";
    },
    dob(v) {
        if (!v) return "Enter your date of birth.";
        const d = new Date(v);
        const today = new Date();
        if (isNaN(d)) return "Enter a valid date.";
        if (d > today) return "Date of birth cannot be in the future.";
        if (d.getFullYear() < 1900) return "Enter a valid date of birth.";
        return "";
    },
    city(v) {
        return v ? "" : "Enter your city or municipality.";
    },
    province(v) {
        const needed = getRegion() === "province";
        return needed && !v ? "Enter your province." : "";
    },
    zip(v) {
        if (v && !/^\d{4}$/.test(v)) return "Philippine ZIP codes have 4 digits.";
        return "";
    },
};

function getRegion() {
    return form.elements.region.value;
}
function validateField(id) {
    const input = $(id);
    const field = input.closest(".field");
    const msg = rules[id](input.value.trim());
    const errorEl = field.querySelector(".error");

    errorEl.textContent = msg;
    field.classList.toggle("invalid", !!msg);
    field.classList.toggle("valid", !msg && input.value.trim() !== "");
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
}

Object.keys(rules).forEach((id) => {
    const input = $(id);
    input.addEventListener("blur", () => {
        if (input.value.trim() !== "" || input.required) validateField(id);
        input.dataset.touched = "true";
    });
    input.addEventListener("input", () => {
        if (input.dataset.touched) validateField(id);
    });
});


$("email").addEventListener("input", () => {
    if ($("confirmEmail").dataset.touched) validateField("confirmEmail");
});
$("userId").addEventListener("input", () => {
    if ($("confirmUserId").dataset.touched) validateField("confirmUserId");
});

$("userId").addEventListener("input", (e) => {
    $("uidCounter").textContent = `${e.target.value.length} / 20`;
});


$("crn").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^\d-]/g, "");
});
$("zip").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
});


$("dob").max = new Date().toISOString().split("T")[0];


document.querySelectorAll('input[name="region"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        const isProvince = getRegion() === "province";
        provinceField.hidden = !isProvince;
        $("province").required = isProvince;
        if (!isProvince) {
            $("province").value = "";
            provinceField.classList.remove("invalid", "valid");
            provinceField.querySelector(".error").textContent = "";
        }
    });
});


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ids = Object.keys(rules);
    const results = ids.map((id) => ({ id, ok: validateField(id) }));
    const firstBad = results.find((r) => !r.ok);

    if (firstBad) {
        const count = results.filter((r) => !r.ok).length;
        formError.textContent = `Please fix ${count} ${count === 1 ? "field" : "fields"} marked in red before registering.`;
        formError.hidden = false;
        $(firstBad.id).focus();
        return;
    }

    formError.hidden = true;
    $("successName").textContent = `${$("givenName").value.trim()} ${$("surname").value.trim()}`;
    $("successId").textContent = $("userId").value.trim();
    form.hidden = true;
    success.hidden = false;
    success.focus();
});


function resetState() {
    form.querySelectorAll(".field").forEach((f) => {
        f.classList.remove("invalid", "valid");
        const err = f.querySelector(".error");
        if (err) err.textContent = "";
    });
    form.querySelectorAll("input").forEach((i) => {
        delete i.dataset.touched;
        i.removeAttribute("aria-invalid");
    });
    formError.hidden = true;
    provinceField.hidden = true;
    $("province").required = false;
    $("uidCounter").textContent = "0 / 20";
}

form.addEventListener("reset", resetState);

$("againBtn").addEventListener("click", () => {
    form.reset();
    resetState();
    success.hidden = true;
    form.hidden = false;
    $("crn").focus();
});