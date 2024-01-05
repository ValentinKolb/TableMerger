import {ActionIcon, Input, InputWrapper, InputWrapperProps, List, Text} from "@mantine/core";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {useState} from "react";
import classes from "./ListInput.module.css";

export default function ListInput<T extends string | number>({
                                                                 value,
                                                                 onChange,
                                                                 itemPrefix,
                                                                 type,
                                                                 placeholder,
                                                                 emptyLabel,
                                                                 ...props
                                                             }: {
    value?: T[],
    onChange?: (value: T[]) => void,
    type?: "text" | "number",
    placeholder?: string,
    itemPrefix?: string,
    emptyLabel?: string,
} & Omit<InputWrapperProps, "value" | "onChange">) {

    const [temp, setTemp] = useState<T>()

    const updateValue = () => {
        if (temp !== undefined && temp !== "" && !(value ?? []).includes(temp)) {
            onChange && onChange([...(value ?? []), temp])
            setTemp(undefined)
        }
    }

    const removeItem = (item: T) => {
        onChange && onChange((value ?? []).filter(v => v !== item))
    }

    return (
        <InputWrapper {...props} >
            <List
                classNames={{
                    root: classes.listRoot,
                    item: classes.listItem,
                    itemWrapper: classes.listItemWrapper,
                    itemLabel: classes.listItemLabel,
                }}
            >
                {(value ?? []).map((v, i) => (
                    <List.Item key={i}>
                        <Text truncate="end" size={"sm"}>
                            <Text c={"dimmed"} span>
                                {itemPrefix}
                            </Text>
                            {v}
                        </Text>

                        <ActionIcon
                            variant={"transparent"}
                            aria-label={"remove item"}
                            size={"xs"}
                            color={"red"}
                            onClick={() => {
                                removeItem(v)
                            }}
                        >
                            <IconTrash/>
                        </ActionIcon>
                    </List.Item>
                ))}
            </List>

            {emptyLabel && (value ?? []).length === 0 && (
                <Text c={"dimmed"} size={"sm"} maw={"100%"} truncate={"end"}>
                    {emptyLabel}
                </Text>
            )}

            <div className={classes.group}>
                <Input
                    type={type ?? "text"}
                    placeholder={placeholder ?? "add item"}
                    size={"sm"}
                    value={temp ?? ""}
                    onChange={(e) => {
                        setTemp(e.currentTarget.value as unknown as T)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            updateValue()
                        }
                    }}
                />

                <ActionIcon
                    variant={"transparent"}
                    aria-label={"add item"}
                    onClick={() => {
                        updateValue()
                    }}
                >
                    <IconPlus/>
                </ActionIcon>
            </div>
        </InputWrapper>
    )
}