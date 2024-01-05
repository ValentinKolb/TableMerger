import {ActionIcon, Group, Input, InputWrapperProps} from "@mantine/core";
import {IconMinus, IconPlus} from "@tabler/icons-react";
import classes from "./CountInput.module.css";

export default function CountInput({
                                       min, max, value, onChange,
                                       ...props
                                   }: {
    min?: number,
    max?: number,
    value?: number,
    onChange?: (value: number) => void,

} & InputWrapperProps) {

    return (
        <Input.Wrapper
            {...props}
        >
            <Group className={classes.group} justify={"center"}>
                <ActionIcon
                    variant={"transparent"}
                    aria-label={"decrement value"}
                    size={"xs"}
                    color={"red"}
                    onClick={() => {
                        if (min !== undefined && (value ?? 0) <= min) return
                        onChange && onChange((value ?? 1) - 1)
                    }}
                >
                    <IconMinus/>
                </ActionIcon>

                <Input
                    mt={0}
                    variant={"unstyled"}
                    type={"number"}
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => {
                        onChange && onChange(parseInt(event.currentTarget.value))
                    }}
                    style={{
                        width: `calc(${value ? value.toString().length : 1}ch)`
                    }}
                />

                <ActionIcon
                    variant={"transparent"}
                    aria-label={"increment value"}
                    size={"xs"}
                    color={"green"}
                    onClick={() => {
                        if (max !== undefined && (value ?? 0) >= max) return
                        onChange && onChange((value ?? 0) + 1)
                    }}
                >
                    <IconPlus/>
                </ActionIcon>

            </Group>
        </Input.Wrapper>
    )
}