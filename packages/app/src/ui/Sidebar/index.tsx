import { For, Show, createSignal } from 'solid-js';

import RepositoryStore, { IRepository } from '@app/stores/repository';
import { createStoreListener } from '@stores/index';
import { ILogCommit } from '@app/modules/git/log';
import LocationStore from '@stores/location';
import FileStore from '@stores/files';
import * as Git from '@modules/git';

import EmptyState from '@ui/Common/EmptyState';
import Header from '@ui/Sidebar/Header';
import Item from '@ui/Sidebar/Item';
import Commit from './Commit';
import Footer from './Footer';

import './index.scss';

export interface ISidebarProps {
	sidebar: boolean;
}

export default (props: ISidebarProps) => {
	const files = createStoreListener([FileStore, LocationStore], () =>
		FileStore.getFilesByRepositoryPath(LocationStore.selectedRepository?.path)
	);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const [commits, setCommits] = createSignal<ILogCommit[]>([]);

	let lastRepository: IRepository | undefined;

	createStoreListener([RepositoryStore, LocationStore], async () => {
		if (lastRepository === LocationStore.selectedRepository) return;

		lastRepository = LocationStore.selectedRepository;

		setCommits(await Git.Log(LocationStore.selectedRepository));
	});

	return (
		<div classList={{ sidebar: true, 'sidebar-active': props.sidebar }}>
			<Header />
			<Show when={historyOpen()}>
				<div class="sidebar__commits">
					<Show
						when={commits()?.length}
						fallback={<EmptyState hint="No commits to show." />}
					>
						<For each={commits()}>
							{(commit) => {
								return <Commit {...commit} />;
							}}
						</For>
					</Show>
				</div>
			</Show>
			<Show when={!historyOpen()}>
				<div class="sidebar__items">
					<Show
						when={files()?.length}
						fallback={<EmptyState hint="You're all up to date." />}
					>
						<For each={files()}>
							{(file) => {
								if (file.status === 'untracked') return null;

								return <Item {...file} />;
							}}
						</For>
					</Show>
				</div>
			</Show>
			<Show when={!historyOpen()}>
				<Footer />
			</Show>
		</div>
	);
};
