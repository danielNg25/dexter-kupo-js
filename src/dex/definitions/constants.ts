export enum MetadataKey {
    Message = 674,
}

export enum DatumParameterKey {
    /**
     * Generics.
     */
    Action = 'Action',
    TokenPolicyId = 'TokenPolicyId',
    TokenAssetName = 'TokenAssetName',
    ReserveA = 'ReserveA',
    ReserveB = 'ReserveB',
    CancelDatum = 'CancelDatum',
    AScale = 'AScale',
    BScale = 'BScale',
    WingRidersV2Special = 'WingRidersV2Special',

    /**
     * Stable Pool specific
     */
    Balance0 = 'Balance0',
    Balance1 = 'Balance1',
    TotalLiquidity = 'TotalLiquidity',
    AmplificationCoefficient = 'AmplificationCoefficient',
    OrderHash = 'OrderHash',

    /**
     * Chadswap specific
     */
    FilledAmount = 'FilledAmount',
    RemainingAmount = 'RemainingAmount',
    UnitPrice = 'UnitPrice',
    UnitPriceDenominator = 'UnitPriceDenominator',

    /**
     * Swap/wallet info.
     */
    SenderPubKeyHash = 'SenderPubKeyHash',
    SenderStakingKeyHash = 'SenderStakingKeyHash',
    SenderKeyHashes = 'SenderKeyHashes',
    ReceiverPubKeyHash = 'ReceiverPubKeyHash',
    ReceiverStakingKeyHash = 'ReceiverStakingKeyHash',
    SwapInAmount = 'SwapInAmount',
    SwapInTokenPolicyId = 'SwapInTokenPolicyId',
    SwapInTokenAssetName = 'SwapInTokenAssetName',
    SwapOutTokenPolicyId = 'SwapOutTokenPolicyId',
    SwapOutTokenAssetName = 'SwapOutTokenAssetName',
    MinReceive = 'MinReceive',
    Expiration = 'Expiration',
    AllowPartialFill = 'AllowPartialFill',
    Direction = 'Direction',

    /**
     * Trading fees.
     */
    TotalFees = 'TotalFees',
    BatcherFee = 'BatcherFee',
    DepositFee = 'DepositFee',
    ScooperFee = 'ScooperFee',
    BaseFee = 'BaseFee',
    FeeSharingNumerator = 'FeeSharingNumerator',
    OpeningFee = 'OpeningFee',
    FinalFee = 'FinalFee',
    FeesFinalized = 'FeesFinalized',
    MarketOpen = 'MarketOpen',
    ProtocolFee = 'ProtocolFee',
    SwapFee = 'SwapFee',
    ProjectFeeInBasis = 'ProjectFeeInBasis',
    ReserveFeeInBasis = 'ReserveFeeInBasis',
    FeeBasis = 'FeeBasis',
    AgentFee = 'AgentFee',

    /**
     * LP info.
     */
    PoolIdentifier = 'PoolIdentifier',
    TotalLpTokens = 'TotalLpTokens',
    LpTokenPolicyId = 'LpTokenPolicyId',
    LpTokenAssetName = 'LpTokenAssetName',
    LpFee = 'LpFee',
    LpFeeNumerator = 'LpFeeNumerator',
    LpFeeDenominator = 'LpFeeDenominator',
    PoolAssetAPolicyId = 'PoolAssetAPolicyId',
    PoolAssetAAssetName = 'PoolAssetAAssetName',
    PoolAssetATreasury = 'PoolAssetATreasury',
    PoolAssetABarFee = 'PoolAssetABarFee',
    PoolAssetBPolicyId = 'PoolAssetBPolicyId',
    PoolAssetBAssetName = 'PoolAssetBAssetName',
    PoolAssetBTreasury = 'PoolAssetBTreasury',
    PoolAssetBBarFee = 'PoolAssetBBarFee',
    RootKLast = 'RootKLast',
    LastInteraction = 'LastInteraction',
    RequestScriptHash = 'RequestScriptHash',
    StakeAdminPolicy = 'StakeAdminPolicy',
    LqBound = 'LqBound',
    LovelaceDeduction = 'LovelaceDeduction',

    Unknown = 'Unknown',
}

export enum TransactionStatus {
    Building,
    Signing,
    Submitting,
    Submitted,
    Errored,
}

export enum AddressType {
    Contract,
    Base,
    Enterprise,
}
