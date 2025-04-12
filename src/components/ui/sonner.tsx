
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={1500} // Set default duration to 1.5 seconds
      className="toaster group"
      closeButton // Adicionando o botão de fechar para toasts que possam ficar presos
      richColors // Cores melhoradas para distinguir tipos de toasts
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "toast-success",
          error: "toast-error",
          info: "toast-info",
          warning: "toast-warning",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
