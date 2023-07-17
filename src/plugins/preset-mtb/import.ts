import type grapesjs from 'grapesjs';


import { cmdImport } from './consts';

// type CommandInterface = Parameters<grapesjs.Commands["add"]>[1];

interface Options {
    modalImportTitle?: string
    modalImportButton?: string
    modalImportLabel?: string
    modalImportContent?: string
    importViewerOptions?: {
        stylePrefix?: string;
        inlineCss?: boolean;
    }
}

const defaultOptions = {
    modalImportTitle: 'Import',
    modalImportButton: 'Import',
    modalImportLabel: '',
    modalImportContent: '',
    importViewerOptions: {},
}

export default (editor: grapesjs.Editor, opts?: Options) => {

    const config: Required<Options> = {
        ...defaultOptions,
        ...opts
    }

    const pfx = editor.getConfig('stylePrefix');
    const modal = editor.Modal;
    const container = document.createElement('div');
    const importLabel = config.modalImportLabel;
    const importCnt = config.modalImportContent;

    const codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
    let viewerEditor = codeViewer.editor;

    // Init import button
    const btnImp = document.createElement('button');
    btnImp.type = 'button';
    btnImp.innerHTML = config.modalImportButton;
    btnImp.className = `${pfx}btn-prim ${pfx}btn-import`;
    btnImp.onclick = e => {
        editor.Css.clear();
        editor.setComponents(viewerEditor.getValue().trim());
        modal.close();
    };

    // Init code viewer
    codeViewer.set({
        ...{
            codeName: 'htmlmixed',
            theme: 'hopscotch',
            readOnly: 0
        }, ...config.importViewerOptions
    });

    editor.Commands.add(cmdImport, {
        run(editor) {
            if (!viewerEditor) {
                const txtarea = document.createElement('textarea');

                if (importLabel) {
                    const labelEl = document.createElement('div');
                    labelEl.className = `${pfx}import-label`;
                    labelEl.innerHTML = importLabel;
                    container.appendChild(labelEl);
                }

                container.appendChild(txtarea);
                container.appendChild(btnImp);
                codeViewer.init(txtarea);
                viewerEditor = codeViewer.editor;
            }

            modal.setTitle(config.modalImportTitle);
            modal.setContent(container);
            const cnt = typeof importCnt == 'function' ? importCnt(editor) : importCnt;
            codeViewer.setContent(cnt || '');
            modal.open().onceClose(() => editor.stopCommand(cmdImport))
            viewerEditor.refresh();
        },

        // stop() {
        //     modal.close();
        // }
    });
};
