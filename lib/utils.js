const { readFileSync } = require('fs');

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const compiler = require('vue-template-compiler');

export const extractComponentOption = (path, optionKey) => {
    let componentOptions = {};
    const Component = compiler.parseComponent(readFileSync(path).toString());
    if (!Component.script || Component.script.content.length < 1) {
        return componentOptions;
    }

    const script = Component.script.content;

    try {
        const parsed = parser.parse(script, {
            sourceType: 'module',
            plugins: [
                'nullishCoalescingOperator',
                'optionalChaining',
                'classProperties',
                'decorators-legacy',
                'dynamicImport',
                'estree',
                'exportDefaultFrom'
            ]
        });

        traverse(parsed, {
            enter(path) {
                if (path.node.type === 'Property') {
                    if (path.node.key.name === optionKey) {
                        const data = script.substring(path.node.start, path.node.end);
                        componentOptions = Function(`return ({${data}})`)()[optionKey];
                    }
                }
            }
        });
    } catch (e) {
        console.error(`[extractComponentOptions] ${e}`);
    }

    return componentOptions;
};
