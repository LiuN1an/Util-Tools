import {
  ComponentProps,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react";

type ModalItemProps = {
  key: string;
  component: FC;
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
          ReactDOM.createPortal(<Component />, modalRef)
        )}
    </>
  );
};

const ModalWrapper = (props: ModalProps & { key: string }) => {
  const Render = props.children;
  const [isOpen, setOpen] = useState(true);

  const onClose = () => {
    props.onClose?.();
    setOpen(false);
    setTimeout(() => {
      hide(props.key);
    }, 300);
  };

  return (
    <Modal {...props} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Render onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

type ModalProps = Omit<
  ComponentProps<typeof Modal>,
  "isOpen" | "onClose" | "children"
> & {
  onClose?: () => void;
  children: FC<{ onClose: () => void }>;
};

const show = (props: ModalProps) => {
  if (typeof window !== "undefined") {
    const key = `zy-modal-${Date.now()}`;
    const newModal = {
      key,
      component: () => <ModalWrapper {...props} key={key} />,
    };
    changeModals?.((prevModals) => [...prevModals, newModal]);
  }
};

const hide = (key: string) => {
  if (typeof window !== "undefined") {
    changeModals?.((prevModals) =>
      prevModals.filter((modal) => modal.key !== key)
    );
  }
};

const _export = {
  show,
  hide,
  Portal,
};

export default _export;
