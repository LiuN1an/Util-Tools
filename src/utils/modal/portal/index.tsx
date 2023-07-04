import {
  ComponentProps,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";
import Modal from "xxx";

type ModalItemProps = {
  key: string;
  component: JSX.Element;
};

let existModals: ModalItemProps[] | null = null;
let changeModals: Dispatch<SetStateAction<ModalItemProps[]>> | null = null;

const Portal = () => {
  const [modalRef, setModalRef] = useState<HTMLDivElement | null>(null);

  const [modals, setModals] = useState<ModalItemProps[]>([]);

  useEffect(() => {
    changeModals = setModals;
    existModals = modals;
  }, [setModals, modals]);

  return (
    <>
      <div
        ref={(ele) => {
          setModalRef(ele);
        }}
      />
      {modalRef &&
        modals.map(({ component: Component }) =>
          ReactDOM.createPortal(Component, modalRef)
        )}
    </>
  );
};

const show = (
  props: ComponentProps<typeof Modal> & {
    customFooter?: (hide?: () => void) => ReactNode;
  }
) => {
  if (typeof window !== "undefined") {
    const key = `cs-modal-${Date.now()}`;
    const newModal = {
      key,
      component: (
        <Modal
          {...props}
          open={true}
          maskClosable={true}
          afterClose={() => {
            props.afterClose?.();
            hide(key);
          }}
          onOk={(p) => {
            props.onOk?.(p);
            hide(key);
          }}
          onCancel={(p) => {
            props.onCancel?.(p);
            hide(key);
          }}
          footer={props.customFooter?.(() => hide(key))}
          className=""
        />
      ),
    };
    const container = document.createElement("div");
    container.setAttribute("id", key);
    // if it's based on nextjs
    // document.getElementById("__next")?.appendChild(container);
    changeModals?.((prevModals) => [...prevModals, newModal]);
  }
};

const hide = (key: string) => {
  if (typeof window !== "undefined") {
    const modalToRemove = existModals?.find((modal) => modal.key === key);

    if (modalToRemove) {
      document.getElementById(key)?.remove(); // 移除 DOM 容器
      changeModals?.((prevModals) =>
        prevModals.filter((modal) => modal.key !== key)
      );
    }
  }
};

const ExampleModal = () => {
  show({
    title: <span className="">xxx</span>,
    children: <div>null</div>,
    customFooter: (hide) => {
      return <div>footer</div>;
    },
  });
};

const _export = {
  show,
  hide,
  Portal,
  ExampleModal,
};

export default _export;
