import React, { useEffect, useState } from "react";
import { Button, Icon, Spinner, Stack, Tag, Text, Tooltip, useColorMode } from "@chakra-ui/core";
import useAxios from "axios-hooks";
import format from "string-format";
import useConfig from "~/components/HyperglassProvider";

format.extend(String.prototype, {});

const labelBg = { dark: "secondary", light: "secondary" };
const labelBgSuccess = { dark: "success", light: "success" };

const ResolvedTarget = React.forwardRef(({ target, setTarget, formQueryTarget }, ref) => {
    const { colorMode } = useColorMode();
    const config = useConfig();
    const labelBgStatus = { true: labelBgSuccess[colorMode], false: labelBg[colorMode] };
    const params4 = {
        url: "https://cloudflare-dns.com/dns-query",
        params: { name: target, type: "A" },
        headers: { accept: "application/dns-json" },
        timeout: 1000
    };
    const params6 = {
        url: "https://cloudflare-dns.com/dns-query",
        params: { name: target, type: "AAAA" },
        headers: { accept: "application/dns-json" },
        timeout: 1000
    };

    const [{ data: data4, loading: loading4, error: error4 }] = useAxios(params4);
    const [{ data: data6, loading: loading6, error: error6 }] = useAxios(params6);

    const [data, setData] = useState("");

    data && setTarget({ field: "query_target", value: data });

    const handleOverride = overridden => {
        setData(overridden);
        setTarget({ field: "query_target", value: overridden });
    };

    const isSelected = value => {
        console.log("value: ", value, "formQuerytarget: ", formQueryTarget, "target: ", target);
        return labelBgStatus[value === formQueryTarget];
    };

    useEffect(() => {
        if (data6 && data6.Answer && data6.Answer[0].type === 28 && data === "") {
            handleOverride(data6.Answer[0].data);
        }
    }, [data6, data]);
    useEffect(() => {
        if (data4 && data4.Answer && data4.Answer[0].type === 28 && data === "") {
            handleOverride(data4.Answer[0].data);
        }
    }, [data4, data]);
    return (
        <Stack
            ref={ref}
            isInline
            w="100%"
            justifyContent={data4?.Answer && data6?.Answer ? "space-between" : "flex-end"}
        >
            {loading4 ||
                error4 ||
                (data4?.Answer?.[0] && (
                    <Tag>
                        <Tooltip
                            hasArrow
                            label={config.branding.text.fqdn_tooltip.format({ protocol: "IPv4" })}
                            placement="bottom"
                        >
                            <Button
                                height="unset"
                                minW="unset"
                                fontSize="xs"
                                py="0.1rem"
                                px={2}
                                mr={2}
                                variantColor={isSelected(data4.Answer[0].data)}
                                borderRadius="md"
                                onClick={() => handleOverride(data4.Answer[0].data)}
                            >
                                IPv4
                            </Button>
                        </Tooltip>
                        {loading4 && <Spinner />}
                        {error4 && <Icon name="warning" />}
                        {data4?.Answer?.[0] && (
                            <Text fontSize="xs" fontFamily="mono" as="span" fontWeight={400}>
                                {data4.Answer[0].data}
                            </Text>
                        )}
                    </Tag>
                ))}
            {loading6 ||
                error6 ||
                (data6?.Answer?.[0] && (
                    <Tag>
                        <Tooltip
                            hasArrow
                            label={config.branding.text.fqdn_tooltip.format({ protocol: "IPv6" })}
                            placement="bottom"
                        >
                            <Button
                                height="unset"
                                minW="unset"
                                fontSize="xs"
                                py="0.1rem"
                                px={2}
                                mr={2}
                                variantColor={isSelected(data6.Answer[0].data)}
                                borderRadius="md"
                                onClick={() => handleOverride(data6.Answer[0].data)}
                            >
                                IPv6
                            </Button>
                        </Tooltip>
                        {loading6 && <Spinner />}
                        {error6 && <Icon name="warning" />}
                        {data6?.Answer?.[0] && (
                            <Text fontSize="xs" fontFamily="mono" as="span" fontWeight={400}>
                                {data6.Answer[0].data}
                            </Text>
                        )}
                    </Tag>
                ))}
        </Stack>
    );
});

ResolvedTarget.displayName = "ResolvedTarget";
export default ResolvedTarget;
