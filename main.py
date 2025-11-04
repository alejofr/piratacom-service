from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

service = Service(ChromeDriverManager().install())

# Si quieres que la ventana del navegador permanezca abierta tras terminar el script,
# pon keep_open = True. Si es False, el navegador se cerrará cuando termine el script.
keep_open = True

options = Options()
if keep_open:
    # Esta opción hace que Chrome no se cierre automáticamente cuando el proceso WebDriver termina
    options.add_experimental_option("detach", True)

driver = webdriver.Chrome(service=service, options=options)

try:


    # 1. Navega a una ruta "vacía" del dominio para poder setear cookies sin mostrar la interfaz
    driver.get("https://chatgpt.com/favicon.ico")
    time.sleep(1)

    # 2. Inyecta las cookies
    driver.add_cookie({
        "name": "__Secure-next-auth.callback-url",
        "value": "https%3A%2F%2Fchatgpt.com%2F",
        "domain": "chatgpt.com",
        "path": "/"
    })
    driver.add_cookie({
        "name": "__Secure-next-auth.session-token",
        "value": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..fAPvWWtuA7htuo-3.vir_hL2A8_ypNV3Bo0nRWKY5XalpxiDzypNPxTsqn2Qqe-4hjhpN-ren_VZgT-ZtWSOcE9jZ1N8DlA_yuy0mKkLhEiKQN1vBa0Krt-nL1kkvVBa8E5hnwRw4IWtDF73yB4QneMUO99wgI_trQVAr3M4r53YhPHI6RS1WBInRnubgrSya6hOOLPcMSqdXErsCF01TZrUU-qMQrUxEw8LGyS9QOTuiXHn-W5VD1SxzPayfBAid13hZoBQWg_bIQpRwagNL8wYxoxQ6ZsO9mEiyqapv4XyXjeDX_ZumrO0caN7ZfKbEE3us_pNq-nmvUbEccXc-5hUcjSs_c1LoRqSDjcqL9uJPDafk31rvqazNSGkEgxL7tJWsE7awnNdfhe6n1BUnoMz_m0UZC3ExCoRu8pggh_3GyR9CR1XwFaOMH9yxqtrf9T9teufZ6BN6TJM5o3CV-kZnkdql521fXkERiorJEKoU5OUpRC7JgLRNGyxTh6sDxU5S7niuhk7eCWTwdkpRJIgZLFwE6YTVGfR7Silr4XuiZBGvsNpyy5v9CetEX7BcC9RHJB5_qXVylqSK3BAREB-cija1xVN1yA9QPN5RLPJu_4omErEZePco7t99fhiQd3MUgwHU6JY-bQGtAiR7Mv3mOFnR7sU9-3NxNRRAMXf2cM6f1VoYSniB8A2h7F_i0Xh88dogFk3FMTnxVdNEoD6bfBdYGhFPrgC_lgCvGm0ggVTGNtjPn8Y8qvvbNqTrHFafRqL5WfN5vIayx6JpTBZ3a2cjvU5WDFhafnEuMuh6BR2dKXA1xnHwNyz6Vg8_06PVuxUynVus4MegFweYXdcEjuJ6jH04lKTMHDbyJVfykEJ4e3XdpISgGyiUTltodKmXySwLb_rVc0G26sBgoQdtcrNEOT1p8p3FrhctezMg14PVL85CDrwX3FsaLbGW7erSW4gASY38a5WQB19MYltz3RE5gOIHJQAVPk2cjKyaLTdvts9kypqbm0J86bRmNAdmXl_qtQAGCtxoW-Mh_8JQEIA2Kzw9D1nqD_l3nQslOXOTi2_z9NcOF_75eUMsCFf_9Ig49t1ZUfHZ_tBjFh7Hw91Qz8Om5ox7Bzu5cWTH51p66lDuogMFQMt7JO6r57_sDGnj5QIJsngzH_2Cgx_G3GRskOeCgJp90-ytnSooM7Olh9ggXJ-THU_S1ExNaRagUw_QkF_o9Fyvto1IsVZnD3Bk5c-vLaitoHVY3GqWbQN3_P47AvxAjVXda2zY1WSVxV1xdkH4C9-U-7FtULQbmV3_L37yN4R9_KW1R45WaXDU_tkXU5k-vdltHloW6DJ4yvtCONMSaMnBKqJ3mPm9ZVkA1FmOM--LKF1kEFsUPGf48_xSpyuqfP69Ued6g92s6v78KrCz5WLoS4B_ZWTObSgEY1Z1j123SGn7pNm7NpGWEYjG9sQiMRV7qXG_AqqtVY4-_j8A8G9sksc2lUrVXzR0vvWPvcVusf7RzIpZANQ2NeP2844Zg7pgjwaGpKqJJzMLd5t02wHqEmU0M6nvEWo220rMaxrOeFlCL8d37G9SyND_zjn9zwsT9dz0DK9EFCDrIHCCnxCqK3sZv98BweZ_mqxNbPvTvbBxCgpP2cys3_cLwuxBkQ6Xg0M-wV2hqnsyAaS9CG3-RDOuIWibf3vDyf7tr_swSbav2yiRoIHBxrXP6gwDDxHOVlpR3_s7TC9cII9bUEG94GI5dRYtUmbNFOTnZlpdEIGEU0beJkXOHbNnYcNLC2HHlsfBxS9TvUvnFwBjdgvzKZPNGTwVKW550Za-dUvtN9wz-xerUb_Ez92EzsX31oFl5WQIVY0S95PmzbO05scg6Z8mpp8LnayhIsitBrsAHzpQ-8yZT5yc0dnU5oQ_elLoZzBWirl71S9_QdCP1r1oBQWBaCWozs2A96y_rxrQY44bS9umanbkCsmOhcVMRPooUxawZS7gr0D9N0EjdHoPzAksJk7nqRwSCVo-EzJe3ERyJfo4qktHc3s6KmtOWez6E17wYqapYep5EEz0pdSI37P_84xUwyMhKCyE7Upz4YG7-y7wlngwYkMyT_Vgt-h6bopB3gSECTMDn7nEZNfjde4HXOdmUoPK7RZmE_iRETadJ4flCNO7UThi55uCTp7NXGSTSFEIT7qZLgysIRZ_xuOIqIS644UXAgFwAXEZlPmHHe4CnoVxV5ftSrnUTvlPni66XxrT0BpjugQpm0mBb5faUU7LlHP-vBXcD5xPVf2CjCgtmG3zGN-Ukx94H5ePOa3YS-9LQoPA-eFHndwPLlQo6F10E8KbsuUWbRivpZ1i2QmXiv4kP7tT8_ZXghFnNmmwVzaYgmtadtzmISqfm3i5-jSog1-fBRcL_GrNUGn9U_ZUvXzBeeni-fc1UvpDMXR1PgSOTmNjYy2Og0MFaPLAG6JPQ4GE_DDLuMW0w6SbZzJiClCHZDYkoFSDjkXHQChNNJCcjUQeeNzDhdv1W5iuao-74J-ic4c56qPE6er7UAhxO9wUoJZq4b0n3FrVnav8TJEuuMiohpmehN8l5AM_4OLDesGP7IJFe1IRxmMDydDM3Kq_1MBCkrKA6_cTCAfD9PnpXx4rHujvbcIGHNuyx0RqtCw4lFQ3gQ9dYTIWU8InwZ2SEJwwnlS8fGDeaeyYEszoOfrxapbLhNGqyquC1Oz71ga27PooXJzkLWE6jhgsMQa1fJiguv2rYJWuVYLQV2OY_Tud7BIXYecs03N3D8rmnAVnQGZ7j3C52xeS6FD6owoNkM-KaE8TlmhjhZxC8FOVzMVU0AGHk45_ymqDQdRhHzksGDSZgZjq-875VRK7aFBq7ReKk-bFDVrwSWYhfvcpaUZAw8wtvhPp2JWpIqJiYi6SSCaFfn1TEjmNJRpR9-nkHfxMXpKsYBRNPsF-YGuteWpJVblTMmTOHvMpfNtY4faQQKkMcBIrMg5uc9Zb6_rzVOfDLm2iQjI_SSZWtG89vz1QfSeExzmj9eWJ6dFMFW20wkCaRYd87E_Xcb7uuYomjVp53gr0OFZhwH_32BcwJ6aHm-Ku0-efqDsP-DZktm0UD7Uob8VN_jjGoAyDk8QHncf6qNyeT-e8d9n7N9Ezv325_2fl1muLSurdKHOAF46WLS8xexEwiRPjbvAGbsF8rX61JOfPV665qXjg2e3cJ13AVEZtKQxU_LQ3HZh4DXpgtgB7iFz8JoLbEvM.wFTw9Um4LjzFu6TaCbwBMg",
        "domain": "chatgpt.com",
        "path": "/"
    })

    # 3. Ahora sí navega a la página principal (ya autenticado)
    driver.get("https://chatgpt.com/")
    time.sleep(2)

    driver.refresh()  # Refresca para aplicar las cookies

    time.sleep(5)  # Espera para ver si la sesión está activa
    print("Cookies actuales:", driver.get_cookies())

except Exception as e:
    # Muestra el error en caso de fallo
    print('error', e)

# Si keep_open es True, hacemos una pausa para que puedas inspeccionar el navegador
if keep_open:
    try:
        print("Presiona Enter para cerrar y terminar el script...")
        input()
    except Exception:
        # En entornos sin stdin esto puede fallar; en ese caso simplemente terminamos
        pass