import {type Selection} from 'vscode';
import * as vscode from 'vscode';


const sortSelectionsByPosition = (selections: readonly Selection[]): Selection[] => {
    return [...selections].sort((s1, s2) => {
        const start1 = s1.start;
        const start2 = s2.start;

        const byLine = start1.line - start2.line;
        if (byLine !== 0) {
            return byLine;
        } else {
            const byCharacter = start1.character - start2.character;
            return byCharacter;
        }
    });
};
const sortSelectionsByCharacter = (selections: readonly Selection[]): Selection[] => {
    return [...selections].sort((s1, s2) => {
        return s2.start.character - s1.start.character;
    });
};

const groupSelectionsByLine = (selections: readonly Selection[]): Record<number, Selection[]> => {
    var result: Record<number, Selection[]> = {};
    selections.forEach((selection) => {
        const line = selection.start.line;
        if (result[line] !== undefined) {
            result[line].push(selection);
        } else {
            result[line] = [selection];
        }
    });
    return result;
};

const sortEachEntryByCharacter = (obj: Record<number, Selection[]>): Record<number, Selection[]> => {
    const result: Record<number, Selection[]> = {};
    Object.keys(obj).map(Number).forEach((key) => {
        result[key] = sortSelectionsByCharacter(obj[key]);
    });
    return result;
}

const allEqual = <A>(xs: A[]): boolean => {
    for (let i = 1; i < xs.length; ++i) {
        if (xs[i] !== xs[0]) {
            return false;
        }
    }
    return true;
};

const extractSelectionsToAlign = (selections: Record<number, Selection[]>): Selection[] => {
    let alignmentIndex = 0;
    let candidates: Selection[] = [];
    while (true) {
        candidates = Object
            .values(selections)
            .map((selectionsThisLine) => selectionsThisLine[alignmentIndex])
            .filter((x) => x !== undefined);
        if (candidates.length <= 0) {
            return candidates;
        } else if (allEqual(candidates.map((selection) => selection.start.character))) {
            ++alignmentIndex;
        } else {
            return candidates;
        }
    }
};

// extractSelectionsToAlign = (selectionsByLine) ->
//     alignmentIndex = 0
//     candidates = []
//     loop
//         candidates = prelude.mapMaybe ((list) -> list[alignmentIndex]), selectionsByLine
//         if candidates.length <= 0
//             break
//         else if allEqual (candidates.map selectionLib.column)
//             ++alignmentIndex
//         else
//             break
//     candidates

export const align = () => {
    const selections = vscode.window.activeTextEditor?.selections;
    if (selections === undefined) {
        return;
    }
    const lineGroups = groupSelectionsByLine(selections);
    const lineGroupsSorted = sortEachEntryByCharacter(lineGroups);
    const selectionsToAlign = extractSelectionsToAlign(lineGroupsSorted);

    // Continue here:
    // git show a2ffb78b6a862fa14ed5dc432aaf3d4e9c51abff~:.atom/packages-custom/quchen-addons/lib/commands/align.coffee
    // alignSelections selectionsToAlign, alignmentDirection
    // removeCommonWhitespacePrefix selectionsToAlign
};
