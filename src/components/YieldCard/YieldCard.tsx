import React, { useState } from "react";
import Protocol from "../Protocol";
import AssetIcon from "../AssetIcon";
import styles from "../../pages/MyYieldsPage.module.css";
import { useOptimizationStore } from "../../store/optimizationStore";
import { useOptimizeInformationStore } from "../../store/optimizeInformationStore";
import { useLockAPYInformationStore } from "../../store/lockApyInformationStore";
import { useWithdrawModalStore } from "../../store/withdrawModalStore";
import type { YieldCardProps } from "./types";
import { useYieldCard } from "./useYieldCard";
import MaturityBadge from "./MaturityBadge";
import YieldInfo from "./YieldInfo";
import YieldActions from "./YieldActions";
import { API_BASE_URL } from "../../utils/constants";

const YieldCard: React.FC<YieldCardProps & { isHighestYield?: boolean }> = (
  props,
) => {
  const { asset, optimizationData, onOptimize, isHighestYield } = props;

  //  Add toggle state
  const [showAllPeriods, setShowAllPeriods] = useState(false);

  const { openModal } = useOptimizationStore();
  const { openInformationModal } = useOptimizeInformationStore();
  const { openLockAPYInformationModal } = useLockAPYInformationStore();
  const { openModal: openWithdrawModalGlobal } = useWithdrawModalStore();

  const {
    protocol,
    apy,
    hasLockYield,
    lockYieldDetails,
    showMaturity,
    formattedMaturityDate,
    daysUntilMaturity,
    isNativeToken,
    chainId,
    balanceNum,
    dailyYieldUsd,
    yearlyYieldUsd,
    handleLockAPYConfirm,
    handleWithdrawComplete,
    handleWithdraw,
  } = useYieldCard(props);

  const handleOptimize = () => {
    if (optimizationData) {
      openInformationModal({
        asset,
        optimizationData,
        onConfirm: handleOptimizeConfirm,
      });
    }
  };

  const handleOptimizeConfirm = () => {
    if (optimizationData) {
      openModal({
        asset,
        currentProtocol: optimizationData.currentProtocol,
        currentApy: optimizationData.currentApy,
        betterProtocol: optimizationData.betterProtocol,
        betterApy: optimizationData.betterApy,
        additionalYearlyUsd: optimizationData.additionalYearlyUsd,
        onOptimize: onOptimize || (() => {}),
      });
    }
  };

  const handleLockAPYClick = () => {
    if (lockYieldDetails) {
      openLockAPYInformationModal({
        asset,
        protocol: lockYieldDetails.protocol,
        expirationDate: lockYieldDetails.expirationDate,
        currentAPY: apy,
        amountToLock: balanceNum,
        onConfirm: handleLockAPYConfirm,
      });
    }
  };

  const handleWithdrawClick = () => {
    openWithdrawModalGlobal({
      asset,
      protocol,
      balance: asset.currentBalanceInProtocol || 0,
      maxDecimals: asset.maxDecimalsShow || 6,
      isNativeToken,
      onWithdraw: handleWithdraw,
      onComplete: () => handleWithdrawComplete(true),
    });
  };

  return asset.currentBalanceInProtocolUsd &&
    Number(asset.currentBalanceInProtocolUsd) > 0 ? (
    <div
      className={`${styles.yieldCardSlim} ${isHighestYield ? styles.highestYieldHighlight : ""}`}
      style={{ position: "relative" }}
    >
      <div className={styles.cardTopSection}>
        <div className={styles.assetInfoSlim}>
          <AssetIcon
            assetIcon={asset.icon ? API_BASE_URL + asset.icon : ""}
            assetName={asset.token}
            chainId={asset.chainId}
            size="medium"
          />
          <div>
            <div
              className={styles.assetNameBold}
              style={{ display: "flex", alignItems: "center" }}
            >
              {asset.token}
              {showMaturity && (
                <MaturityBadge
                  maturityDate={formattedMaturityDate}
                  formattedMaturityDate={formattedMaturityDate}
                  daysUntilMaturity={daysUntilMaturity}
                />
              )}
            </div>
            <div className={styles.detailsRow}>
              <Protocol
                name={protocol}
                showLogo={true}
                className={styles.protocolBadge}
              />
            </div>
          </div>
        </div>

        <div className={styles.apyBadge}>
          <span className={styles.apyValue}>{apy.toFixed(2)}%</span>
          <span className={styles.apyLabel}>APY</span>
        </div>
      </div>

      {/* ✅ Pass showAllPeriods down to YieldInfo */}
      <YieldInfo
        asset={asset}
        apy={apy}
        balanceNum={balanceNum}
        dailyYieldUsd={dailyYieldUsd}
        yearlyYieldUsd={yearlyYieldUsd}
        showAllPeriods={showAllPeriods}
      />

      {/* ✅ View more / View less toggle */}
      <button
        className={styles.viewMoreBtn}
        onClick={() => setShowAllPeriods((prev) => !prev)}
      >
        {showAllPeriods ? "▲ View less" : "▼ View more"}
      </button>

      <YieldActions
        asset={asset}
        hasLockYield={hasLockYield}
        chainId={chainId}
        optimizationData={optimizationData}
        onWithdrawClick={handleWithdrawClick}
        onOptimize={handleOptimize}
        onLockAPYClick={handleLockAPYClick}
      />
    </div>
  ) : (
    <></>
  );
};

export default YieldCard;
