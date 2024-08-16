/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './index.css';

import {$isCodeNode} from '@lexical/code';
import {$getNearestNodeFromDOMNode, LexicalEditor} from 'lexical';
import {Options} from 'prettier';
import * as React from 'react';
import {useState} from 'react';

interface Props {
  lang: string;
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

const PRETTIER_PARSER_MODULES = {
  css: () => import('prettier/parser-postcss'),
  html: () => import('prettier/parser-html'),
  js: () => import('prettier/parser-babel'),
  markdown: () => import('prettier/parser-markdown'),
} as const;

type LanguagesType = keyof typeof PRETTIER_PARSER_MODULES;

async function loadPrettierParserByLang(lang: string) {
  const dynamicImport = PRETTIER_PARSER_MODULES[lang as LanguagesType];
  return await dynamicImport();
}

async function loadPrettierFormat() {
  const {format} = await import('prettier/standalone');
  return format;
}

const PRETTIER_OPTIONS_BY_LANG: Record<string, Options> = {
  css: {
    parser: 'css',
  },
  html: {
    parser: 'html',
  },
  js: {
    parser: 'babel',
  },
  markdown: {
    parser: 'markdown',
  },
};

const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG);

export function canBePrettier(lang: string): boolean {
  return LANG_CAN_BE_PRETTIER.includes(lang);
}

function getPrettierOptions(lang: string): Options {
  const options = PRETTIER_OPTIONS_BY_LANG[lang];
  if (!options) {
    throw new Error(
      `CodeActionMenuPlugin: Prettier does not support this language: ${lang}`,
    );
  }

  return options;
}

export function PrettierButton({lang, editor, getCodeDOMNode}: Props) {
  const [syntaxError, setSyntaxError] = useState<string>('');
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  async function handleClick(): Promise<void> {
    const codeDOMNode = getCodeDOMNode();

    try {
      const format = await loadPrettierFormat();
      const options = getPrettierOptions(lang);
      options.plugins = [await loadPrettierParserByLang(lang)];

      if (!codeDOMNode) {
        return;
      }

      editor.update(() => {
        const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(codeNode)) {
          const content = codeNode.getTextContent();

          let parsed = '';

          try {
            parsed = format(content, options);
          } catch (error: unknown) {
            setError(error);
          }

          if (parsed !== '') {
            const selection = codeNode.select(0);
            selection.insertText(parsed);
            setSyntaxError('');
            setTipsVisible(false);
          }
        }
      });
    } catch (error: unknown) {
      setError(error);
    }
  }

  function setError(error: unknown) {
    if (error instanceof Error) {
      setSyntaxError(error.message);
      setTipsVisible(true);
    } else {
      console.error('Unexpected error: ', error);
    }
  }

  function handleMouseEnter() {
    if (syntaxError !== '') {
      setTipsVisible(true);
    }
  }

  function handleMouseLeave() {
    if (syntaxError !== '') {
      setTipsVisible(false);
    }
  }

  return (
    <div className="prettier-wrapper">
      <button
        className="menu-item"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="prettier">
        {syntaxError ? (
          <i className="format prettier-error" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 32 32"><path fill="#56b3b4" d="M21.714 8.571h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-1.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#ea5e5e" d="M4.571 26.857h5.714a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571a.57.57 0 0 1-.571-.57a.57.57 0 0 1 .571-.572"/><path fill="#bf85bf" d="M18.286 17.714h3.429a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-3.429a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#ea5e5e" d="M11.429 17.714H16a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-4.571a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#56b3b4" d="M4.571 17.714h4.572a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571a.57.57 0 0 1-.571-.57a.57.57 0 0 1 .571-.572"/><path fill="#bf85bf" d="M4.571 22.286h5.714a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571A.57.57 0 0 1 4 22.857a.57.57 0 0 1 .571-.571m0-9.143h5.714a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571A.57.57 0 0 1 4 13.714a.57.57 0 0 1 .571-.571"/><path fill="#f7ba3e" d="M10.286 6.286h11.428a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H10.286a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#ea5e5e" d="M4.571 6.286H8a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.572H4.571A.57.57 0 0 1 4 6.857a.57.57 0 0 1 .571-.571"/><path fill="#f7ba3e" d="M9.143 24.571h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H9.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#56b3b4" d="M9.143 10.857h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H9.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571M4.571 24.571h2.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571a.57.57 0 0 1-.571-.57a.57.57 0 0 1 .571-.572"/><path fill="#f7ba3e" d="M4.571 10.857h2.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.572H4.571A.57.57 0 0 1 4 11.429a.57.57 0 0 1 .571-.572"/><path fill="#d0d4d8" d="M19.429 24.571h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-1.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m-6.858 0h4.571a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-4.571a.57.57 0 0 1-.571-.57a.57.57 0 0 1 .571-.572m10.286 0h4.571a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-4.571a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571" opacity=".5"/><path fill="#56b3b4" d="M13.714 15.429h9.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-9.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#f7ba3e" d="M8 15.429h3.429A.57.57 0 0 1 12 16a.57.57 0 0 1-.571.571H8A.57.57 0 0 1 7.429 16A.57.57 0 0 1 8 15.429"/><path fill="#ea5e5e" d="M4.571 15.429h1.143a.57.57 0 0 1 .572.571a.57.57 0 0 1-.571.571H4.571A.57.57 0 0 1 4 16a.57.57 0 0 1 .571-.571"/><path fill="#bf85bf" d="M14.857 8.571h4.571a.57.57 0 0 1 .572.572a.57.57 0 0 1-.571.571h-4.572a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.572"/><path fill="#56b3b4" d="M4.571 8.571h8a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-8A.57.57 0 0 1 4 9.143a.57.57 0 0 1 .571-.572"/><path fill="#f7ba3e" d="M8 20h10.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H8a.57.57 0 0 1-.571-.571A.57.57 0 0 1 8 20"/><path fill="#bf85bf" d="M4.571 20h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571A.57.57 0 0 1 4 20.571A.57.57 0 0 1 4.571 20"/><path fill="#ea5e5e" d="M18.286 10.857H24a.57.57 0 0 1 .571.571A.57.57 0 0 1 24 12h-5.714a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.572"/><path fill="#f7ba3e" d="M18.286 13.143H24a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-5.714a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571"/><path fill="#56b3b4" d="M4.571 4h13.715a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H4.571A.57.57 0 0 1 4 4.571A.57.57 0 0 1 4.571 4"/><path fill="#d0d4d8" d="M20.571 4h6.857a.57.57 0 0 1 .572.571a.57.57 0 0 1-.571.571h-6.858A.57.57 0 0 1 20 4.571A.57.57 0 0 1 20.571 4m0 16h2.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-2.286a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m4.572 0h2.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-2.286a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571M24 17.714h3.429a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H24a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m0-11.428h3.429a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H24a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m1.143 9.143h2.286A.57.57 0 0 1 28 16a.57.57 0 0 1-.571.571h-2.286a.57.57 0 0 1-.572-.571a.57.57 0 0 1 .572-.571m0-6.858h2.286a.57.57 0 0 1 .571.572a.57.57 0 0 1-.571.571h-2.286a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.572m1.143 2.286h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-1.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m0 2.286h1.143a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-1.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m-9.143 9.143h10.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571H17.143a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m-4.572 0h2.286a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-2.286a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m9.143 4.571h5.714a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-5.714a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571m-9.143 0h6.857a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-6.857a.57.57 0 0 1-.571-.57a.57.57 0 0 1 .571-.572m0-16H16a.57.57 0 0 1 .571.571A.57.57 0 0 1 16 12h-3.429a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.572m0 2.286H16a.57.57 0 0 1 .571.571a.57.57 0 0 1-.571.571h-3.429a.57.57 0 0 1-.571-.571a.57.57 0 0 1 .571-.571" opacity=".5"/></svg>
        )}
      </button>
      {tipsVisible ? (
        <pre className="code-error-tips">{syntaxError}</pre>
      ) : null}
    </div>
  );
}
