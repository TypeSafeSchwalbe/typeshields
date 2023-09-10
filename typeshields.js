
const _TYPE_SHIELD_DEFINE = (typeof_name, name) => {
    const checker = (value) => {
        if(typeof_name !== undefined && typeof value !== typeof_name) {
            throw `type mismatch: expected type '${name}', got '${typeof value}' instead`;
        }
        return value;
    };
    checker._TYPE_SHIELD_AS_STRING = name;
    return checker;
};

const any = _TYPE_SHIELD_DEFINE(undefined, "any");

const unit = _TYPE_SHIELD_DEFINE("undefined", "unit");

const number = _TYPE_SHIELD_DEFINE("number", "number");

const string = _TYPE_SHIELD_DEFINE("string", "string");

const boolean = _TYPE_SHIELD_DEFINE("boolean", "boolean");

const symbol = _TYPE_SHIELD_DEFINE("symbol", "symbol");

const object = (member_types) => {
    if(typeof member_types !== "object") { throw "The provided member types are invalid!"; }
    const checker = (value) => {
        if(typeof value !== "object") { throw "The value is not an object!"; }
        for(const member_name of Object.keys(member_types)) {
            try {
                if(!value.hasOwnProperty(member_name)) { throw null; }
                (member_types[member_name]) (value[member_name]);
            } catch(e) {
                throw `type mismatch (member '${member_name}' of '${checker._TYPE_SHIELD_AS_STRING}'): expected type '${member_types[member_name]._TYPE_SHIELD_AS_STRING}', got '${typeof value[member_name]}' instead`;
            }
        }
        return value;
    };
    checker._TYPE_SHIELD_AS_STRING = `object {${Object.keys(member_types).map((member_name) => `${member_name}: ${member_types[member_name]._TYPE_SHIELD_AS_STRING}`).join(", ")}}`;
    return checker;
};

const func = (param_types, return_type) => {
    if(!(param_types instanceof Array)) { throw "The provided parameter types are invalid!"; }
    if(typeof return_type !== "function") { throw "The provided return type is invalid!"; }
    const checker = (value) => {
        if(typeof value !== "function") { throw "The value is not a function!"; }
        if(value._TYPE_SHIELD_IS_CHECKER_WRAPPER === true) { return value; }
        const wrapper = (...arguments) => {
            if(arguments.length !== param_types.length) { throw `type mismatch: function '${checker._TYPE_SHIELD_AS_STRING}' expected ${param_types.length} argument${param_types.length === 1? "" : "s"}, got ${arguments.length} instead`; }
            for(let p = 0; p < param_types.length; p += 1) {
                try {
                    (param_types[p]) (arguments[p]);
                } catch(e) {
                    const dp = p + 1;
                    const pf = dp % 10 === 1? "st" : dp % 10 === 2? "nd" : dp % 10 === 3? "rd" : "th";
                    throw `type mismatch (${dp}${pf} parameter of '${checker._TYPE_SHIELD_AS_STRING}'): expected type '${param_types[p]._TYPE_SHIELD_AS_STRING}', got '${typeof arguments[p]}' instead`;
                }
            }
            const returned = value(...arguments);
            try {
                return (return_type) (returned);
            } catch(e) {
                throw `type mismatch (return value of '${checker._TYPE_SHIELD_AS_STRING}'): expected type '${return_type._TYPE_SHIELD_AS_STRING}', got '${typeof returned}' instead`;
            }
        };
        wrapper._TYPE_SHIELD_IS_CHECKER_WRAPPER = true;
        return wrapper;
    };
    checker._TYPE_SHIELD_AS_STRING = `func([${param_types.map((t) => t._TYPE_SHIELD_AS_STRING).join(", ")}], ${return_type._TYPE_SHIELD_AS_STRING})`
    return checker;
};

const array = (content_type) => {
    if(typeof content_type !== "function") { throw "The provided content type is invalid!"; }
    const checker = (value) => {
        if(value.constructor !== Array) { throw `type mismatch: expected type '${checker._TYPE_SHIELD_AS_STRING}', got '${typeof value}' instead`; }
        for(let i = 0; i < value.length; i += 1) {
            try {
                (content_type) (value[i]);
            } catch(e) {
                const di = i + 1;
                const pf = di % 10 === 1? "st" : di % 10 === 2? "nd" : di % 10 === 3? "rd" : "th";
                throw `type mismatch (${di}${pf} element (index ${i}) of '${checker._TYPE_SHIELD_AS_STRING}'): expected type '${content_type._TYPE_SHIELD_AS_STRING}', got '${typeof value[i]}' instead`;
            }
        }
        return value;
    };
    checker._TYPE_SHIELD_AS_STRING =`array(${content_type._TYPE_SHIELD_AS_STRING})`;
    return checker;
}

const instance = (class_constructor) => {
    if(typeof class_constructor !== "function") { throw "The provided class is invalid!"; }
    const checker = (value) => {
        if(!(value instanceof class_constructor)) { throw `type mismatch: expected type '${checker._TYPE_SHIELD_AS_STRING}', got '${typeof value}' instead`; }
        return value;
    };
    checker._TYPE_SHIELD_AS_STRING =`instance(${class_constructor.name})`;
    return checker;
};

const union = (...possible_types) => {
    const checker = (value) => {
        for(const t of possible_types) {
            try {
                return (t) (value);
            } catch(e) {}
        }
        throw `type mismatch: expected type '${checker._TYPE_SHIELD_AS_STRING}', got '${typeof value}' instead`;
    };
    checker._TYPE_SHIELD_AS_STRING =`union(${possible_types.map((t) => t._TYPE_SHIELD_AS_STRING).join(", ")})`;
    return checker;
};


if(typeof module !== "undefined") { module.exports = { any, unit, number, string, object, func, array, instance, union }; }