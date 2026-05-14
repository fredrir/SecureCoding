import { Badge, Tooltip } from "@mantine/core";
import { OWASP_TOP_10, type OwaspTop10Id } from "@/domain/owasp";

export function Top10Badge({ id }: { id: OwaspTop10Id }) {
  return (
    <Tooltip
      label={`OWASP Top 10 - ${OWASP_TOP_10[id]}`}
      withArrow
      openDelay={250}
    >
      <Badge variant="light" color="orange" size="sm" radius="sm" tt="none">
        {id}
      </Badge>
    </Tooltip>
  );
}
