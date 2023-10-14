/**
 * Generated by RelaGit v{{VERSION}}
 *
 * DO NOT MODIFY THIS FILE DIRECTLY
 */

type action =
	| '*'
	| 'commit'
	| 'pull'
	| 'push'
	| 'repository_add'
	| 'repository_remove'
	| 'remote_fetch'
	| 'settings_update';

interface WorkflowOptions<T extends action | action[] = action> {
	/**
	 * The event(s) to trigger this workflow.
	 */
	on: T;
	/**
	 * The name of the workflow (ideally should be unique).
	 */
	name: string;
	description?: string;
	steps: {
		/**
		 * What to refer to this step as in errors and logs.
		 */
		name?: string;
		/**
		 * The action to run.
		 * @param trigger {action} - The event which triggered this workflow run
		 * @example
		 * import {context} from "relagit:actions";
		 *
		 * // ...
		 *
		 * run(trigger, event) {
		 *   if (trigger === "push") {
		 *    console.log("Pushed to branch", context().repository.name, event.ref)}
		 *   }
		 * }
		 */
		run: (trigger: T, ...arguments: unknown[]) => Promise<void> | void;
	}[];
}

interface Context {
	Git: {
		Push: (repository: IRepository) => Promise<void>;
		Commit: (repository: IRepository, message: string, description: string) => Promise<void>;
	};
	Repository: IRepository;
}

interface IRepository {
	draft?: boolean;
	id: string;
	path: string;
	name: string;
	remote: string;
	branch: string;
	commit: string;
	ahead: number;
	behind: number;
	lastFetched?: number;
}

interface IDraftCommit {
	files: string[];
}

interface ICommit {
	message: string;
	description: string;
	files: string[];
}

interface IFile {
	id: number;
	name: string;
	staged: boolean;
	path: string;
	status:
		| 'added'
		| 'modified'
		| 'deleted'
		| 'untracked'
		| 'unknown'
		| 'unmerged'
		| 'copied'
		| 'renamed'
		| 'type-changed';
}

interface ThemeOptions {
	name: string;
	description?: string;
	accent?: string;
	main: string;
}

interface Themes {
	/**
	 * Construct a new theme
	 * @example
	 * import { Theme } from "relagit:themes";
	 *
	 * export default new Theme({...})
	 */
	Theme: new (options: ThemeOptions) => void;
}

interface Actions {
	/**
	 * Construct a new workflow runner
	 * @example
	 * import { Workflow } from "relagit:actions";
	 *
	 * export default new Workflow({...})
	 */
	Workflow: new (options: WorkflowOptions) => void;
	/**
	 * When run in a workflow, will return current information about the state of the application.
	 * @returns {Context}
	 */
	context: () => Context;
}

declare module 'relagit:actions' {
	const { Workflow, context }: Actions;
	export { Workflow, context };
}

declare module 'relagit:themes' {
	const { Theme }: Themes;
	export { Theme };
}
