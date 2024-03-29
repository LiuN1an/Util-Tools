import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FC, Fragment, useEffect, useState } from "react";
import { Field } from "./Field";
import { Form } from "./Form";
import { Collapse } from "antd";
import "./style.less";

interface FieldProps {
  field: Field;
}

export const FieldControlView = observer((props: { field: Field }) => {
  const { field } = props;
  if (!field) {
    return null;
  }
  const Control = field.getContent();

  return (
    <Control
      {...field.restProps}
      field={field}
      value={field.value}
      setValue={(value: unknown) => {
        field.setValue(value);
      }}
      error={field.errors.length > 0}
    />
  );
});

export const FieldNormalView: FC<FieldProps> = observer(({ field }) => {
  return (
    <>
      <div
        className={classNames(
          "field-normal-view",
          field.horizontal && "horizontal",
          field.require && "required"
        )}
      >
        {field.label && (
          <div className="field-normal-view-label">{field.label}</div>
        )}
        <div className="field-control">
          <FieldControlView field={field} />
        </div>
      </div>
      {/* Field错误提示+描述 */}
      {field.errors.length ? (
        field.errors.map((error, index) => (
          <div
            className={classNames(
              "field-error",
              field.horizontal && "horizontal"
            )}
            key={index}
          >
            {error}
          </div>
        ))
      ) : (
        <Fragment />
      )}
    </>
  );
});

const { Panel } = Collapse;
export const FieldCollapseView: FC<FieldProps> = observer(({ field }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (field.list.some((c) => c.isError)) {
      setActive(0);
    }
  }, [field.list.some((c) => c.isError)]);

  return (
    <Collapse
      style={{ marginBottom: 8 }}
      activeKey={active}
      onChange={(key) => {
        setActive(key.length ? 0 : -1);
      }}
    >
      <Panel header={field.label} key={0}>
        {field.list.map((field, index) => {
          return (
            <div key={index} style={{ marginBottom: 8 }}>
              <FieldNormalView field={field} />
            </div>
          );
        })}
      </Panel>
    </Collapse>
  );
});

interface FormProps {
  form: Form;
  className?: string;
}
export const FormView: FC<FormProps> = observer(({ form, className }) => {
  return (
    <div className={className}>
      {form.tree.map((node, index) => {
        const fieldType = node.fieldType;
        const View = form.viewMap[fieldType];
        return View ? <View field={node} key={index} /> : <Fragment />;
      })}
    </div>
  );
});
