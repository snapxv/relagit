import { For, Show, createEffect, createSignal, onMount, JSX } from 'solid-js';
import { Transition } from 'solid-transition-group';

import { createStoreListener } from '@stores/index';
import ModalStore from '@stores/modal';
import LayerStore from '@stores/layer';

import Button from '@ui/Common/Button';
import Icon from '@ui/Common/Icon';
import Layer from '@ui/Layer';

import './index.scss';

interface IModalProps {
	transitions: {
		enter: (el: HTMLElement, done: () => void) => void;
		exit: (el: HTMLElement, done: () => void) => void;
	};
	dismissable?: boolean;
	children: (props: { close: () => void }) => JSX.Element | JSX.Element[];
	size: 'small' | 'medium' | 'large' | 'x-large';
}

const Modal = (props: IModalProps) => {
	const [open, setOpen] = createSignal(false);

	let ref;

	onMount(() => {
		requestAnimationFrame(() => {
			setOpen(true);
		});
	});

	const close = () => {
		setOpen(false);

		setTimeout(() => {
			// allow any transitions to finish

			ModalStore.removeModal(ModalStore.modals.find((m) => m.element === ref));
		}, 1000);
	};

	return (
		<div
			ref={ref}
			onMouseDown={(e) => {
				if (props.dismissable && e.target === ref) {
					close();
				}
			}}
			classList={{
				'modal-container': true,
				visible: open()
			}}
		>
			<Transition onEnter={props.transitions.enter} onExit={props.transitions.exit}>
				<Show when={open()}>
					<div class={`modal ${props.size || ''}`}>
						{<props.children close={close}></props.children>}
					</div>
				</Show>
			</Transition>
		</div>
	);
};

export const ModalCloseButton = (props: { close: () => void }) => {
	return (
		<button
			aria-role="button"
			aria-label="Close Modal"
			class="modal__close"
			onClick={props.close}
		>
			<Icon size={24} variant={24} name="x-circle" />
		</button>
	);
};

export const ModalHeader = (props: {
	title?: JSX.Element;
	children: JSX.Element | JSX.Element[];
}) => {
	return (
		<div class="modal__header">
			{props.title && <h2 class="modal__header__title">{props.title}</h2>}
			{props.children}
		</div>
	);
};

export const ModalBody = (props: { children: JSX.Element | JSX.Element[] }) => {
	return <div class="modal__body">{props.children}</div>;
};

export const ModalFooter = (props: { children: JSX.Element | JSX.Element[] }) => {
	return <div class="modal__footer">{props.children}</div>;
};

export default Modal;

Modal.Layer = () => {
	const modals = createStoreListener([ModalStore], () => ModalStore.modals);

	createEffect(() => {
		if (modals().length > 0) {
			LayerStore.setVisible('modal', true);
		} else {
			LayerStore.setVisible('modal', false);
		}
	});

	return (
		<Layer key="modal" transitions={Layer.Transitions.None} type="bare">
			<For each={modals()}>{(modal) => modal.element}</For>
		</Layer>
	);
};

export const showErrorModal = (error: Error, message: string) => {
	ModalStore.addModal({
		type: 'error',
		element: (
			<Modal size="medium" dismissable transitions={Layer.Transitions.Fade}>
				{(props) => (
					<>
						<ModalHeader title={message}>
							<ModalCloseButton close={props.close} />
						</ModalHeader>
						<ModalBody>
							<p class="error-modal__message">{error.message}</p>
							<pre class="error-modal__stack">{error.stack}</pre>
						</ModalBody>
						<ModalFooter>
							<div class="modal__footer__buttons">
								<Button type="default" label="Close Modal" onClick={props.close}>
									Close
								</Button>
								<Button
									type="danger"
									label="Reload Client"
									onClick={() => window.location.reload()}
								>
									Reload
								</Button>
							</div>
						</ModalFooter>
					</>
				)}
			</Modal>
		)
	});
};
