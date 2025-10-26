// src/lib/camunda.ts

interface ProcessVariable {
  value: string;
  type: string;
}

interface StartProcessInstanceParams {
  key: string;
  variables: Record<string, ProcessVariable>;
}

export async function startProcessInstance(params: StartProcessInstanceParams) {
  console.log("Starting process instance:", params);

  // call workflow service to create order
  const response = await fetch("http://localhost:3000/api/order", {
    method: "POST",
    body: JSON.stringify({
      correlationId: params.variables.correlationId?.value,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  const data = await response.json();

  return data;
}
